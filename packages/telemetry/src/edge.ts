import { context, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type {
  EdgeTelemetryOptions,
  Logger,
  LoggerFields,
  RequestContextInput,
  RequestTelemetry,
} from "./types";

let provider: BasicTracerProvider | undefined;

/**
 * Create a request-scoped span and logger for Edge HTTP handlers.
 */
export function createRequestTelemetry(
  ctx: RequestContextInput,
): RequestTelemetry {
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
  const baseFields: LoggerFields = {
    request_id: ctx.requestId,
    span_id: spanCtx.spanId,
    trace_id: spanCtx.traceId,
    user_id: ctx.userId ?? undefined,
    http_method: ctx.httpMethod,
    http_route: ctx.httpRoute,
  };

  const logger = createSpanLogger(baseFields, span);

  const end: RequestTelemetry["end"] = (fields) => {
    if (fields?.error) {
      span.recordException(fields.error as Error);
    }
    if (fields) {
      for (const [key, value] of Object.entries(fields)) {
        if (key === "error") continue;
        span.setAttribute(key, value as never);
      }
    }
    span.end();
  };

  const activeCtx = trace.setSpan(context.active(), span);
  context.with(activeCtx, () => {
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
 * Initialise OpenTelemetry for Edge runtimes (e.g. Cloudflare Workers).
 *
 * This function is idempotent and can be called multiple times safely.
 */
export function initEdgeTelemetry(options: EdgeTelemetryOptions): void {
  if (provider) return;

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: options.serviceName,
    "deployment.environment": options.env,
  });

  const exporter = new OTLPTraceExporter({
    headers: {
      Authorization: `Bearer ${options.axiom.apiToken}`,
    },
    url: options.axiom.otlpEndpoint,
  });

  provider = new BasicTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  provider.register();
}

function createSpanLogger(
  baseFields: LoggerFields,
  span = trace.getActiveSpan(),
): Logger {
  const log = (
    level: "debug" | "error" | "info" | "warn",
    message: string,
    fields?: LoggerFields,
  ) => {
    const merged = {
      level,
      message,
      ...baseFields,
      ...fields,
    };

    span?.addEvent("log", merged);
  };

  return {
    debug: (message, fields) => log("debug", message, fields),
    error: (message, fields) => log("error", message, fields),
    info: (message, fields) => log("info", message, fields),
    warn: (message, fields) => log("warn", message, fields),
  };
}
