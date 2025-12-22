/**
 * @packageDocumentation
 * Edge runtime helpers for wiring OpenTelemetry exporters to Axiom over OTLP/HTTP.
 *
 * @remarks
 * Import from `@o3osatoshi/telemetry/edge`.
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
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from "@opentelemetry/sdk-logs";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type {
  Attributes,
  EdgeTelemetryOptions,
  Logger,
  MetricCounter,
  MetricHistogram,
  MetricOptions,
  RequestContext,
  RequestTelemetry,
  Severity,
} from "./types";
import { toLogAttributes, toLogRecordSeverity } from "./utils";

let traceProvider: BasicTracerProvider | undefined;
let meterProvider: MeterProvider | undefined;
let loggerProvider: LoggerProvider | undefined;
let options: EdgeTelemetryOptions | undefined;
let logger: OpenTelemetryLogger | undefined;

/**
 * Edge metrics helper exposed by {@link getEdgeMetrics}.
 *
 * @remarks
 * Instruments are cached by name and created on demand from the global
 * OpenTelemetry {@link @opentelemetry/api#Meter}.
 *
 * @public
 */
export interface EdgeMetrics {
  /**
   * Get or create a counter metric with the given name.
   */
  getCounter(name: string, options?: MetricOptions): MetricCounter;
  /**
   * Get or create a histogram metric with the given name.
   */
  getHistogram(name: string, options?: MetricOptions): MetricHistogram;
}

type Counter = OpenTelemetryCounter<Attributes>;
type Histogram = OpenTelemetryHistogram<Attributes>;

let edgeMetrics: EdgeMetrics | undefined;

/**
 * Logger that emits OpenTelemetry log records via the logs API in Edge
 * runtimes.
 *
 * @remarks
 * Intended for process‑level logs (for example, background jobs) that
 * should flow through OpenTelemetry logs rather than span events.
 *
 * @public
 */
export interface EdgeLogger {
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
 * Access Edge metrics instruments backed by the global OpenTelemetry Meter.
 *
 * @remarks
 * - Requires {@link initEdgeTelemetry} to have been called so that a Meter
 *   with an OTLP exporter is registered.
 * - Instruments are created lazily and cached by name.
 *
 * @public
 */
export function getEdgeMetrics(): EdgeMetrics {
  if (edgeMetrics) return edgeMetrics;

  const meter = metrics.getMeter("@o3osatoshi/telemetry/edge");

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

  edgeMetrics = {
    getCounter,
    getHistogram,
  };

  return edgeMetrics;
}

let edgeLogger: EdgeLogger | undefined;

/**
 * Create (or reuse) a process‑level logger that emits OpenTelemetry log
 * records via the logs API in Edge runtimes.
 *
 * @remarks
 * - Requires {@link initEdgeTelemetry} to have been called so that a
 *   log provider and OTLP exporter are registered.
 * - Log records are exported to the dataset configured via
 *   {@link EdgeTelemetryOptions.datasets.logs}.
 *
 * @public
 */
export function createEdgeLogger(): EdgeLogger {
  if (edgeLogger) return edgeLogger;

  const logger = getLogger();

  const emit = (level: Severity, message: string, attributes?: Attributes) => {
    const { severityNumber, severityText } = toLogRecordSeverity(level);

    const logAttributes = toLogAttributes(attributes);

    logger.emit({
      ...(logAttributes ? { attributes: logAttributes } : {}),
      body: message,
      severityNumber,
      severityText,
    });
  };

  edgeLogger = {
    debug: (msg, attrs) => emit("debug", msg, attrs),
    error: (msg, attrs) => emit("error", msg, attrs),
    info: (msg, attrs) => emit("info", msg, attrs),
    warn: (msg, attrs) => emit("warn", msg, attrs),
  };

  return edgeLogger;
}

/**
 * Create a request‑scoped span and logger for Edge HTTP handlers.
 *
 * @param ctx - Request metadata used to populate span attributes.
 * @returns Request‑scoped telemetry helpers for the current HTTP request.
 *
 * @remarks
 * - The returned {@link RequestTelemetry} exposes:
 *   - `span` / `spanId` / `traceId` – the underlying OpenTelemetry span
 *     and identifiers.
 *   - `logger` – a span‑bound logger that records `"log"` events and, when
 *     an {@link EdgeTelemetryOptions.errorReporter} is configured, forwards
 *     errors with request/span context.
 *   - `end(attributes, error?)` – attaches attributes, records `error`
 *     as an exception when provided, and ends the span.
 *
 * @public
 */
export function createRequestTelemetry(ctx: RequestContext): RequestTelemetry {
  const tracer = trace.getTracer("@o3osatoshi/telemetry/edge");

  const span = tracer.startSpan("request", {
    attributes: {
      "enduser.id": ctx.userId ?? undefined,
      "request.id": ctx.requestId,
      "client.address": ctx.clientIp,
      "http.method": ctx.httpMethod,
      "http.route": ctx.httpRoute,
      "http.user_agent": ctx.userAgent,
    },
  });

  const spanCtx = span.spanContext();

  const attributes: Attributes = {
    request_id: ctx.requestId,
    span_id: spanCtx.spanId,
    trace_id: spanCtx.traceId,
    user_id: ctx.userId ?? undefined,
    http_method: ctx.httpMethod,
    http_route: ctx.httpRoute,
  };

  const logger = createSpanLogger(attributes, span);

  const setUserId: RequestTelemetry["setUserId"] = (userId) => {
    attributes["user_id"] = userId ?? undefined;
    if (typeof userId === "string" && userId.length > 0) {
      span.setAttribute("enduser.id", userId);
    }
  };

  const end: RequestTelemetry["end"] = (attributes, error) => {
    if (error) {
      span.recordException(
        error instanceof Error ? error : new Error("unknown error"),
      );
    }
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        if (value === undefined) continue;
        span.setAttribute(key, value);
      }
    }
    span.end();
  };

  context.with(trace.setSpan(context.active(), span), () => {
    // No-op: context is now active for downstream code if they use the OTel API.
  });

  return {
    end,
    logger,
    setUserId,
    span,
    spanId: spanCtx.spanId,
    traceId: spanCtx.traceId,
  };
}

/**
 * Initialize OpenTelemetry for Edge runtimes (e.g. Cloudflare Workers).
 *
 * @remarks
 * - Configures a {@link BasicTracerProvider} with:
 *   - a resource containing `service.name` and `deployment.environment`,
 *   - a trace exporter wired to the OTLP/HTTP endpoint and dataset provided
 *     via {@link EdgeTelemetryOptions.axiom} / `datasets.traces`,
 *   - metric and log pipelines wired to `datasets.metrics` / `datasets.logs`.
 *   - a {@link BatchSpanProcessor} for efficient span export.
 * - Registers the provider via {@link trace.setGlobalTracerProvider}.
 * - This function is idempotent and can be called multiple times safely;
 *   subsequent calls are ignored after the first initialization.
 *
 * @public
 */
export function initEdgeTelemetry(
  telemetryOptions: EdgeTelemetryOptions,
): void {
  if (traceProvider) return;

  options = telemetryOptions;

  const {
    logs: logsDataset,
    metrics: metricsDataset,
    traces: tracesDataset,
  } = telemetryOptions.datasets;

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: telemetryOptions.serviceName,
    "deployment.environment": telemetryOptions.env,
  });

  const traceExporter = new OTLPTraceExporter({
    headers: {
      Authorization: `Bearer ${telemetryOptions.axiom.apiToken}`,
      "X-Axiom-Dataset": tracesDataset,
    },
    url: telemetryOptions.axiom.otlpEndpoints.traces,
  });
  const traceProcessor = new BatchSpanProcessor(traceExporter);
  traceProvider = new BasicTracerProvider({
    resource,
    spanProcessors: [traceProcessor],
  });
  trace.setGlobalTracerProvider(traceProvider);

  const metricExporter = new OTLPMetricExporter({
    headers: {
      Authorization: `Bearer ${telemetryOptions.axiom.apiToken}`,
      "X-Axiom-Dataset": metricsDataset,
    },
    url: telemetryOptions.axiom.otlpEndpoints.metrics,
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
      Authorization: `Bearer ${telemetryOptions.axiom.apiToken}`,
      "X-Axiom-Dataset": logsDataset,
    },
    url: telemetryOptions.axiom.otlpEndpoints.logs,
  });
  const logProcessor = new BatchLogRecordProcessor(logExporter);
  loggerProvider = new LoggerProvider({
    processors: [logProcessor],
    resource,
  });
  logs.setGlobalLoggerProvider(loggerProvider);
}

function createSpanLogger(
  baseAttributes: Attributes,
  span = trace.getActiveSpan(),
): Logger {
  const log = (
    severity: Severity,
    message: string,
    attributes?: Attributes,
    error?: unknown,
  ) => {
    span?.addEvent("log", {
      ...baseAttributes,
      ...attributes,
      message,
      severity,
    });

    if (severity === "error" && error && options?.errorReporter) {
      const spanContext = span?.spanContext();
      const eventId = options.errorReporter(error, {
        requestId: baseAttributes["request_id"] as string | undefined,
        spanId: spanContext?.spanId,
        traceId: spanContext?.traceId,
        userId: baseAttributes["user_id"] as string | undefined,
      });

      if (eventId) {
        span?.setAttribute("sentry_event_id", eventId);
      }
    }
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
    logger = logs.getLogger("@o3osatoshi/telemetry/edge");
  }
  return logger;
}
