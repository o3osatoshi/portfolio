/**
 * @packageDocumentation
 * Node.js runtime helpers for wiring OpenTelemetry exporters to Axiom over OTLP/HTTP.
 *
 * @remarks
 * Import from `@o3osatoshi/telemetry/node`.
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
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type {
  Attributes,
  Logger,
  MetricCounter,
  MetricHistogram,
  MetricOptions,
  NodeTelemetryOptions,
  RequestContext,
  RequestTelemetry,
  Severity,
} from "./types";
import { toLogAttributes, toLogRecordSeverity } from "./utils";

let sdk: NodeSDK | undefined;
let options: NodeTelemetryOptions | undefined;

/**
 * Node metrics helper exposed by {@link getNodeMetrics}.
 *
 * @remarks
 * Instruments are cached by name and created on demand from the global
 * OpenTelemetry {@link @opentelemetry/api#Meter}.
 *
 * @public
 */
export interface NodeMetrics {
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

let nodeMetrics: NodeMetrics | undefined;

/**
 * Logger that emits OpenTelemetry log records via the logs API.
 *
 * @remarks
 * - Complements the span‑bound {@link Logger} used in request telemetry
 *   (see {@link createRequestTelemetry}).
 * - Intended for process‑level or background job logging where there may
 *   not be an active span.
 *
 * @public
 */
export interface NodeLogger {
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
 * Access Node metrics instruments backed by the global OpenTelemetry Meter.
 *
 * @remarks
 * - Requires {@link initNodeTelemetry} to have been called so that a Meter
 *   with an OTLP exporter is registered.
 * - Instruments are created lazily and cached by name.
 *
 * @public
 */
export function getNodeMetrics(): NodeMetrics {
  if (nodeMetrics) return nodeMetrics;

  const meter = metrics.getMeter("@o3osatoshi/telemetry/node");

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

  nodeMetrics = {
    getCounter,
    getHistogram,
  };

  return nodeMetrics;
}

let logger: OpenTelemetryLogger | undefined;
let nodeLogger: NodeLogger | undefined;

/**
 * Attach a business event to the currently active span, when available.
 *
 * Intended to be used from HTTP/interface layers that have already
 * established a request span via {@link withRequestTelemetry}.
 *
 * When no span is active, this function is a no‑op.
 *
 * @public
 */
export function addBusinessEventToActiveSpan(
  message: string,
  attributes?: Attributes,
): void {
  const span = trace.getActiveSpan();
  if (!span) return;

  span.addEvent("business_event", {
    ...attributes,
    event_name: message,
  });
}

/**
 * Attach an error‑level business event to the currently active span.
 *
 * @remarks
 * - Adds a `"business_event"` span event with `level: "error"` and the
 *   provided {@link Attributes}.
 * - When `error` is provided it is also recorded as an exception on the span.
 * - When no span is active, this function is a no‑op.
 *
 * @public
 */
export function addErrorBusinessEventToActiveSpan(
  message: string,
  attributes?: Attributes,
  error?: unknown,
): void {
  const span = trace.getActiveSpan();
  if (!span) return;

  span.addEvent("business_event", {
    ...attributes,
    event_name: message,
    level: "error",
  });

  if (error) {
    span.recordException(
      error instanceof Error ? error : new Error("unknown error"),
    );
  }
}

/**
 * Create (or reuse) a process‑level logger that emits OpenTelemetry log
 * records via the logs API.
 *
 * @remarks
 * - Requires {@link initNodeTelemetry} to have been called so that a
 *   log provider and OTLP exporter are registered.
 * - Log records are exported to the same Axiom dataset configured via
 *   {@link NodeTelemetryOptions}.
 *
 * @public
 */
export function createNodeLogger(): NodeLogger {
  if (nodeLogger) return nodeLogger;

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

  nodeLogger = {
    debug: (msg, attrs) => emit("debug", msg, attrs),
    error: (msg, attrs) => emit("error", msg, attrs),
    info: (msg, attrs) => emit("info", msg, attrs),
    warn: (msg, attributes) => emit("warn", msg, attributes),
  };

  return nodeLogger;
}

/**
 * Create a request‑scoped span and logger for Node HTTP handlers.
 *
 * @param ctx - Request metadata used to populate span attributes.
 * @returns Request‑scoped telemetry helpers for the current HTTP request.
 *
 * @remarks
 * - The returned {@link RequestTelemetry} exposes:
 *   - `span` / `spanId` / `traceId` – the underlying OpenTelemetry span
 *     and identifiers.
 *   - `logger` – a span‑bound logger that records `"log"` events and
 *     forwards errors to the configured `errorReporter`.
 *   - `end(attributes, error?)` – attaches attributes, records `error`
 *     as an exception when provided, and ends the span.
 *
 * @public
 */
export function createRequestTelemetry(ctx: RequestContext): RequestTelemetry {
  const tracer = trace.getTracer("@o3osatoshi/telemetry/node");

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
 * Initialize OpenTelemetry for Node runtimes.
 *
 * @remarks
 * - Configures trace, metric, and log pipelines backed by OTLP/HTTP
 *   exporters using the provided Axiom configuration.
 * - Registers a {@link NodeSDK} instance with:
 *   - a resource containing `service.name` and `deployment.environment`,
 *   - a trace exporter,
 *   - a periodic metric reader and exporter,
 *   - a batch log record processor and exporter.
 * - This function is idempotent and can be called multiple times safely;
 *   subsequent calls are ignored after the first initialization.
 *
 * @public
 */
export function initNodeTelemetry(
  telemetryOptions: NodeTelemetryOptions,
): void {
  if (sdk) return;

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

  const logExporter = new OTLPLogExporter({
    headers: {
      Authorization: `Bearer ${telemetryOptions.axiom.apiToken}`,
      "X-Axiom-Dataset": logsDataset,
    },
    url: telemetryOptions.axiom.otlpEndpoints.logs,
  });
  const logProcessor = new BatchLogRecordProcessor(logExporter);

  sdk = new NodeSDK({
    logRecordProcessors: [logProcessor],
    metricReaders: [metricReader],
    resource,
    traceExporter,
  });

  void sdk.start();
}

/**
 * Run a handler function with a request‑scoped span set as the active span.
 *
 * @param ctx - Request metadata used to populate span attributes.
 * @param handler - Function that receives the request telemetry helpers.
 * @returns Result of the handler function.
 *
 * @remarks
 * - Internally calls {@link createRequestTelemetry} and installs the
 *   created span as the active span for the duration of `handler`.
 * - The caller is responsible for invoking `telemetry.end(...)` inside
 *   the handler to close the span.
 *
 * @public
 */
export async function withRequestTelemetry<T>(
  ctx: RequestContext,
  handler: (telemetry: RequestTelemetry) => Promise<T> | T,
): Promise<T> {
  const telem = createRequestTelemetry(ctx);

  return context.with(trace.setSpan(context.active(), telem.span), async () =>
    handler(telem),
  );
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
    logger = logs.getLogger("@o3osatoshi/telemetry/node");
  }
  return logger;
}
