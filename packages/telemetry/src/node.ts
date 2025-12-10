import { context, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type {
  Logger,
  LoggerFields,
  NodeTelemetryOptions,
  RequestContextInput,
  RequestTelemetry,
} from "./types";

let sdk: NodeSDK | undefined;
let nodeOptions: NodeTelemetryOptions | undefined;

/**
 * Create a request-scoped span and logger for Node HTTP handlers.
 */
export function createRequestTelemetry(
  ctx: RequestContextInput,
): RequestTelemetry {
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
 * Initialise OpenTelemetry for Node runtimes.
 *
 * This function is idempotent and can be called multiple times safely.
 */
export function initNodeTelemetry(options: NodeTelemetryOptions): void {
  if (sdk) return;

  nodeOptions = options;

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: options.serviceName,
    "deployment.environment": options.env,
  });

  const traceExporter = new OTLPTraceExporter({
    headers: {
      Authorization: `Bearer ${options.axiom.apiToken}`,
    },
    url: options.axiom.otlpEndpoint,
  });

  sdk = new NodeSDK({
    resource,
    traceExporter,
  });

  void sdk.start();
}

function createSpanLogger(
  baseFields: LoggerFields,
  span = trace.getActiveSpan(),
): Logger {
  const log = (
    level: "debug" | "error" | "info" | "warn",
    message: string,
    fields?: { error?: unknown } & LoggerFields,
  ) => {
    const { error, ...rest } = fields ?? {};

    const merged: LoggerFields = {
      level,
      message,
      ...baseFields,
      ...(rest as LoggerFields),
    };

    // Attach as span event when a span is available.
    span?.addEvent("log", merged);

    if (level === "error" && error && nodeOptions?.errorReporter) {
      const spanContext = span?.spanContext();
      const eventId = nodeOptions.errorReporter(error, {
        requestId: baseFields["request_id"] as string | undefined,
        spanId: spanContext?.spanId,
        traceId: spanContext?.traceId,
        userId: baseFields["user_id"] as string | undefined,
      });

      if (eventId) {
        span?.setAttribute("sentry_event_id", eventId);
      }
    }
  };

  return {
    debug: (message, fields) => log("debug", message, fields),
    error: (message, fields) => log("error", message, fields),
    info: (message, fields) => log("info", message, fields),
    warn: (message, fields) => log("warn", message, fields),
  };
}
