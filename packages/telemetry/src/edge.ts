import { context, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type {
  Attributes,
  EdgeTelemetryOptions,
  Logger,
  LogLevel,
  RequestContext,
  RequestTelemetry,
} from "./types";

let provider: BasicTracerProvider | undefined;
let edgeOptions: EdgeTelemetryOptions | undefined;

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

  const logger = createSpanLogger(
    {
      request_id: ctx.requestId,
      span_id: spanCtx.spanId,
      trace_id: spanCtx.traceId,
      user_id: ctx.userId ?? undefined,
      http_method: ctx.httpMethod,
      http_route: ctx.httpRoute,
    },
    span,
  );

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
 *     via {@link EdgeTelemetryOptions.axiom} / `dataset`,
 *   - a {@link BatchSpanProcessor} for efficient span export.
 * - Registers the provider via {@link trace.setGlobalTracerProvider}.
 * - This function is idempotent and can be called multiple times safely;
 *   subsequent calls are ignored after the first initialization.
 *
 * @public
 */
export function initEdgeTelemetry(options: EdgeTelemetryOptions): void {
  if (provider) return;

  edgeOptions = options;

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: options.serviceName,
    "deployment.environment": options.env,
  });

  const exporter = new OTLPTraceExporter({
    headers: {
      Authorization: `Bearer ${options.axiom.apiToken}`,
      "X-Axiom-Dataset": options.dataset,
    },
    url: options.axiom.otlpEndpoint,
  });

  provider = new BasicTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  trace.setGlobalTracerProvider(provider);
}

function createSpanLogger(
  baseAttributes: Attributes,
  span = trace.getActiveSpan(),
): Logger {
  const log = (
    level: LogLevel,
    message: string,
    attributes?: Attributes,
    error?: unknown,
  ) => {
    span?.addEvent("log", {
      level,
      message,
      ...baseAttributes,
      ...attributes,
    });

    if (level === "error" && error && edgeOptions?.errorReporter) {
      const spanContext = span?.spanContext();
      const eventId = edgeOptions.errorReporter(error, {
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
