import { context, metrics, trace } from "@opentelemetry/api";
import type {
  Counter as OpenTelemetryCounter,
  Histogram as OpenTelemetryHistogram,
} from "@opentelemetry/api";
import type {
  LogAttributes,
  Logger as OpenTelemetryLogger,
} from "@opentelemetry/api-logs";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { LoggerProvider } from "@opentelemetry/sdk-logs";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type {
  Attributes,
  BrowserTelemetryOptions,
  Logger,
  LogLevel,
} from "./types";

let tracerProvider: undefined | WebTracerProvider;
let meterProvider: MeterProvider | undefined;
let loggerProvider: LoggerProvider | undefined;

/**
 * Counter metric wrapper used by browser telemetry helpers.
 *
 * @remarks
 * Backs onto an OpenTelemetry {@link @opentelemetry/api!Counter} with
 * {@link Attributes} as metric attributes.
 *
 * @public
 */
export interface BrowserMetricCounter {
  add(value: number, attributes?: Attributes): void;
}

/**
 * Histogram metric wrapper used by browser telemetry helpers.
 *
 * @remarks
 * Backs onto an OpenTelemetry {@link @opentelemetry/api!Histogram} with
 * {@link Attributes} as metric attributes.
 *
 * @public
 */
export interface BrowserMetricHistogram {
  record(value: number, attributes?: Attributes): void;
}

/**
 * Options for creating metrics instruments in the browser.
 *
 * @remarks
 * Used when creating counters and histograms via {@link getBrowserMetrics}.
 *
 * @public
 */
export interface BrowserMetricOptions {
  description?: string;
  unit?: string;
}

/**
 * Browser metrics helper exposed by {@link getBrowserMetrics}.
 *
 * @remarks
 * Instruments are cached by name and created on demand from the global
 * OpenTelemetry {@link @opentelemetry/api!Meter}.
 *
 * @public
 */
export interface BrowserMetrics {
  /**
   * Get or create a counter metric with the given name.
   */
  getCounter(
    name: string,
    options?: BrowserMetricOptions,
  ): BrowserMetricCounter;
  /**
   * Get or create a histogram metric with the given name.
   */
  getHistogram(
    name: string,
    options?: BrowserMetricOptions,
  ): BrowserMetricHistogram;
}

type Counter = OpenTelemetryCounter<Attributes>;
type Histogram = OpenTelemetryHistogram<Attributes>;

let browserMetrics: BrowserMetrics | undefined;

/**
 * Logger that emits OpenTelemetry log records via the logs API in the browser.
 *
 * @remarks
 * - Complements the span‑bound {@link EventLogger} used for UX events.
 * - Intended for application‑level logs that should flow through OTel logs.
 *
 * @public
 */
export interface BrowserLogger {
  debug(message: string, attributes?: Attributes): void;
  error(message: string, attributes?: Attributes): void;
  info(message: string, attributes?: Attributes): void;
  warn(message: string, attributes?: Attributes): void;
}

/**
 * Access browser metrics instruments backed by the global OpenTelemetry Meter.
 *
 * @remarks
 * - Requires {@link initBrowserTelemetry} to have been called so that a Meter
 *   with an OTLP exporter is registered.
 * - Instruments are created lazily and cached by name.
 *
 * @public
 */
export function getBrowserMetrics(): BrowserMetrics {
  if (browserMetrics) return browserMetrics;

  const meter = metrics.getMeter("@o3osatoshi/telemetry/browser");

  const counters = new Map<string, BrowserMetricCounter>();
  const histograms = new Map<string, BrowserMetricHistogram>();

  const getCounter = (
    name: string,
    options?: BrowserMetricOptions,
  ): BrowserMetricCounter => {
    let counter = counters.get(name);
    if (!counter) {
      const otelCounter: Counter = meter.createCounter(name, options);
      counter = {
        add: (value, attributes) => {
          otelCounter.add(value, attributes);
        },
      };
      counters.set(name, counter);
    }

    return counter;
  };

  const getHistogram = (
    name: string,
    options?: BrowserMetricOptions,
  ): BrowserMetricHistogram => {
    let histogram = histograms.get(name);
    if (!histogram) {
      const otelHistogram: Histogram = meter.createHistogram(name, options);
      histogram = {
        record: (value, attributes) => {
          otelHistogram.record(value, attributes);
        },
      };
      histograms.set(name, histogram);
    }

    return histogram;
  };

  browserMetrics = {
    getCounter,
    getHistogram,
  };

  return browserMetrics;
}

let logger: OpenTelemetryLogger | undefined;
let browserLogger: BrowserLogger | undefined;

/**
 * Session-level context attached to browser telemetry.
 *
 * @remarks
 * Attached to all events emitted by {@link createEventLogger}.
 *
 * @public
 */
export interface BrowserSessionContext {
  sessionId: string;
  userId?: null | string;
}

/**
 * Browser-specific logger that records events on OpenTelemetry spans.
 *
 * @remarks
 * - Log methods (`debug` / `info` / `warn` / `error`) annotate the
 *   currently active span (if any).
 * - The `event` helper creates a short-lived span per UX event and
 *   records a `ux_event` with the provided attributes.
 *
 * @public
 */
export interface EventLogger extends Logger {
  event: (eventName: string, attributes?: Attributes) => void;
}

/**
 * Create (or reuse) an application‑level logger that emits OpenTelemetry log
 * records via the logs API in the browser.
 *
 * @remarks
 * - Requires {@link initBrowserTelemetry} to have been called so that a
 *   log provider and OTLP exporter are registered.
 * - Log records are exported to the same Axiom dataset configured via
 *   {@link BrowserTelemetryOptions}.
 *
 * @public
 */
export function createBrowserLogger(): BrowserLogger {
  if (browserLogger) return browserLogger;

  const logger = getLogger();

  const emit = (level: LogLevel, message: string, attributes?: Attributes) => {
    const { severityNumber, severityText } = mapLogLevel(level);

    const _attributes = toLogAttributes(attributes);

    logger.emit({
      ...(_attributes ? { attributes: _attributes } : {}),
      body: message,
      severityNumber,
      severityText,
    });
  };

  browserLogger = {
    debug: (msg, attrs) => emit("debug", msg, attrs),
    error: (msg, attrs) => emit("error", msg, attrs),
    info: (msg, attrs) => emit("info", msg, attrs),
    warn: (msg, attrs) => emit("warn", msg, attrs),
  };

  return browserLogger;
}

/**
 * Create a browser-side logger enriched with session-level fields.
 *
 * @param session - Session context to attach to all log events.
 * @returns A {@link EventLogger} instance bound to the active span.
 *
 * @remarks
 * - `event(name, attrs)` creates a short‑lived span for the UX event and
 *   records a `"ux_event"` with the provided attributes.
 * - `debug` / `info` / `warn` / `error` annotate the current active span
 *   with `"log"` events that include the session‑level fields.
 *
 * @public
 */
export function createEventLogger(session: BrowserSessionContext): EventLogger {
  const baseAttributes: Attributes = {
    session_id: session.sessionId,
    user_id: session.userId ?? undefined,
  };

  const logger = createSpanLogger(baseAttributes);

  const event: EventLogger["event"] = (eventName, attributes) => {
    const tracer = trace.getTracer("@o3osatoshi/telemetry/browser");
    const span = tracer.startSpan(eventName);

    span.addEvent("ux_event", {
      event_name: eventName,
      ...baseAttributes,
      ...attributes,
    });
    span.end();

    context.with(trace.setSpan(context.active(), span), () => {
      // Context is active within the span lifetime.
    });
  };

  return {
    ...logger,
    event,
  };
}

/**
 * Initialize OpenTelemetry for browser runtimes.
 *
 * @remarks
 * - Configures trace, metric, and log pipelines backed by OTLP/HTTP
 *   exporters using the provided Axiom configuration.
 * - Registers:
 *   - a {@link WebTracerProvider} with a {@link BatchSpanProcessor} for
 *     spans,
 *   - a {@link MeterProvider} with a {@link PeriodicExportingMetricReader}
 *     for metrics,
 *   - a {@link LoggerProvider} with a {@link BatchLogRecordProcessor}
 *     for log records.
 * - All pipelines share a resource containing `service.name` and
 *   `deployment.environment`.
 * - This function is idempotent and can be called multiple times safely;
 *   subsequent calls are ignored after the first initialization.
 *
 * @public
 */
export function initBrowserTelemetry(options: BrowserTelemetryOptions): void {
  if (tracerProvider) return;

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: options.serviceName,
    "deployment.environment": options.env,
  });

  const commonExporterConfig = {
    headers: {
      Authorization: `Bearer ${options.axiom.apiToken}`,
      "X-Axiom-Dataset": options.dataset,
    },
    url: options.axiom.otlpEndpoint,
  } as const;

  const traceExporter = new OTLPTraceExporter(commonExporterConfig);

  tracerProvider = new WebTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
  });

  tracerProvider.register();

  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(commonExporterConfig),
  });

  meterProvider = new MeterProvider({
    readers: [metricReader],
    resource,
  });

  metrics.setGlobalMeterProvider(meterProvider);

  const logExporter = new OTLPLogExporter(commonExporterConfig);
  const logRecordProcessor = new BatchLogRecordProcessor(logExporter);

  loggerProvider = new LoggerProvider({
    processors: [logRecordProcessor],
    resource,
  });

  logs.setGlobalLoggerProvider(loggerProvider);
}

function createSpanLogger(baseAttributes: Attributes): Logger {
  const log = (
    level: LogLevel,
    message: string,
    attributes?: Attributes,
    // Browser loggers do not currently forward errors to an external reporter,
    // but the parameter is accepted to satisfy the shared Logger interface.
    _error?: unknown,
  ) => {
    const span = trace.getActiveSpan();
    span?.addEvent("log", {
      level,
      message,
      ...baseAttributes,
      ...attributes,
    });
  };

  return {
    debug: (msg, attrs) => log("debug", msg, attrs),
    error: (msg, attrs, err) => log("error", msg, attrs, err),
    info: (msg, attrs) => log("info", msg, attrs),
    warn: (msg, attrs) => log("warn", msg, attrs),
  };
}

function getLogger(): OpenTelemetryLogger {
  if (!logger) {
    logger = logs.getLogger("@o3osatoshi/telemetry/browser");
  }
  return logger;
}

function mapLogLevel(level: LogLevel): {
  severityNumber: SeverityNumber;
  severityText: string;
} {
  switch (level) {
    case "debug":
      return {
        severityNumber: SeverityNumber.DEBUG,
        severityText: "DEBUG",
      };
    case "info":
      return {
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
      };
    case "warn":
      return {
        severityNumber: SeverityNumber.WARN,
        severityText: "WARN",
      };
    case "error":
      return {
        severityNumber: SeverityNumber.ERROR,
        severityText: "ERROR",
      };
    default:
      return {
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
      };
  }
}

function toLogAttributes(attributes?: Attributes): LogAttributes | undefined {
  if (!attributes) return undefined;
  return attributes as LogAttributes;
}
