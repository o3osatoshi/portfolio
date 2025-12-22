/**
 * @packageDocumentation
 * Browser runtime helpers for wiring OpenTelemetry exporters to Axiom over OTLP/HTTP.
 *
 * @remarks
 * Import from `@o3osatoshi/telemetry/browser`.
 */

import { context, metrics, trace } from "@opentelemetry/api";
import type {
  Counter as OpenTelemetryCounter,
  Histogram as OpenTelemetryHistogram,
} from "@opentelemetry/api";
import type { Logger as OpenTelemetryLogger } from "@opentelemetry/api-logs";
import { logs } from "@opentelemetry/api-logs";
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
  MetricOptions,
  Severity,
} from "./types";
import { toLogAttributes, toLogRecordSeverity } from "./utils";

let tracerProvider: undefined | WebTracerProvider;
let meterProvider: MeterProvider | undefined;
let loggerProvider: LoggerProvider | undefined;

/**
 * Browser metrics helper exposed by {@link getBrowserMetrics}.
 *
 * @remarks
 * Instruments are cached by name and created on demand from the global
 * OpenTelemetry {@link @opentelemetry/api#Meter}.
 *
 * @public
 */
export interface BrowserMetrics {
  /**
   * Get or create a counter metric with the given name.
   */
  getCounter(name: string, options?: MetricOptions): MetricCounter;
  /**
   * Get or create a histogram metric with the given name.
   */
  getHistogram(name: string, options?: MetricOptions): MetricHistogram;
}

/**
 * Counter metric wrapper used by browser telemetry helpers.
 *
 * @remarks
 * Backs onto an OpenTelemetry {@link @opentelemetry/api#Counter} with
 * {@link Attributes} as metric attributes.
 *
 * @public
 */
export interface MetricCounter {
  add(value: number, attributes?: Attributes): void;
}

/**
 * Histogram metric wrapper used by browser telemetry helpers.
 *
 * @remarks
 * Backs onto an OpenTelemetry {@link @opentelemetry/api#Histogram} with
 * {@link Attributes} as metric attributes.
 *
 * @public
 */
export interface MetricHistogram {
  record(value: number, attributes?: Attributes): void;
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
  /**
   * Emit a debug log record.
   */
  debug(message: string, attributes?: Attributes): void;
  /**
   * Emit an error log record.
   */
  error(message: string, attributes?: Attributes): void;
  /**
   * Emit an info log record.
   */
  info(message: string, attributes?: Attributes): void;
  /**
   * Emit a warn log record.
   */
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

  const counters = new Map<string, MetricCounter>();
  const histograms = new Map<string, MetricHistogram>();

  const getCounter = (name: string, options?: MetricOptions): MetricCounter => {
    let counter = counters.get(name);
    if (!counter) {
      const _counter: Counter = meter.createCounter(name, options);
      counter = {
        add: (value, attributes) => {
          _counter.add(value, attributes);
        },
      };
      counters.set(name, counter);
    }

    return counter;
  };

  const getHistogram = (
    name: string,
    options?: MetricOptions,
  ): MetricHistogram => {
    let histogram = histograms.get(name);
    if (!histogram) {
      const _histogram: Histogram = meter.createHistogram(name, options);
      histogram = {
        record: (value, attributes) => {
          _histogram.record(value, attributes);
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
  /**
   * Client-generated identifier used to correlate UX events within a session.
   */
  sessionId: string;
  /**
   * Authenticated user identifier, when available.
   */
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

  const emit = (
    severity: Severity,
    message: string,
    attributes?: Attributes,
  ) => {
    const { severityNumber, severityText } = toLogRecordSeverity(severity);

    const logAttributes = toLogAttributes(attributes);

    logger.emit({
      ...(logAttributes ? { attributes: logAttributes } : {}),
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
      ...baseAttributes,
      ...attributes,
      event_name: eventName,
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

  const {
    logs: logsDataset,
    metrics: metricsDataset,
    traces: tracesDataset,
  } = options.datasets;

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: options.serviceName,
    "deployment.environment": options.env,
  });

  const traceExporter = new OTLPTraceExporter({
    headers: {
      Authorization: `Bearer ${options.axiom.apiToken}`,
      "X-Axiom-Dataset": tracesDataset,
    },
    url: options.axiom.otlpEndpoints.traces,
  });
  const traceProcessor = new BatchSpanProcessor(traceExporter);
  tracerProvider = new WebTracerProvider({
    resource,
    spanProcessors: [traceProcessor],
  });
  tracerProvider.register();

  const metricExporter = new OTLPMetricExporter({
    headers: {
      Authorization: `Bearer ${options.axiom.apiToken}`,
      "X-Axiom-Dataset": metricsDataset,
    },
    url: options.axiom.otlpEndpoints.metrics,
  });
  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
  });
  meterProvider = new MeterProvider({
    readers: [metricReader],
    resource,
  });
  metrics.setGlobalMeterProvider(meterProvider);

  const logExporter = new OTLPLogExporter({
    headers: {
      Authorization: `Bearer ${options.axiom.apiToken}`,
      "X-Axiom-Dataset": logsDataset,
    },
    url: options.axiom.otlpEndpoints.logs,
  });
  const logProcessor = new BatchLogRecordProcessor(logExporter);
  loggerProvider = new LoggerProvider({
    processors: [logProcessor],
    resource,
  });
  logs.setGlobalLoggerProvider(loggerProvider);
}

function createSpanLogger(baseAttributes: Attributes): Logger {
  const log = (
    severity: Severity,
    message: string,
    attributes?: Attributes,
    _error?: unknown,
  ) => {
    const span = trace.getActiveSpan();
    span?.addEvent("log", {
      ...baseAttributes,
      ...attributes,
      message,
      severity,
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
