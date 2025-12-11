import { context, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type {
  Attributes,
  ErrorAttributes,
  Logger,
  LogLevel,
  NodeTelemetryOptions,
  RequestContext,
  RequestTelemetry,
} from "./types";

let sdk: NodeSDK | undefined;
let nodeOptions: NodeTelemetryOptions | undefined;

/**
 * Create a request-scoped span and logger for Node HTTP handlers.
 *
 * @param ctx - Request metadata used to populate span attributes.
 * @returns Request-scoped telemetry helpers for the current HTTP request.
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

  const end: RequestTelemetry["end"] = (attributes) => {
    if (attributes?.error) {
      if (attributes.error instanceof Error) {
        span.recordException(attributes.error);
      } else {
        span.recordException(new Error("unknown error"));
      }
    }
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        if (key === "error" || value === undefined) continue;
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
 * Initialize OpenTelemetry for Node runtimes.
 *
 * This function is idempotent and can be called multiple times safely.
 *
 * @public
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
      "X-Axiom-Dataset": options.dataset,
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
  baseFields: Attributes,
  span = trace.getActiveSpan(),
): Logger {
  const log = (
    level: LogLevel,
    message: string,
    attributes?: ErrorAttributes,
  ) => {
    const { error, ...rest } = attributes ?? {};

    span?.addEvent("log", {
      level,
      message,
      ...baseFields,
      ...rest,
    });

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
    debug: (message, attributes) => log("debug", message, attributes),
    error: (message, attributes) => log("error", message, attributes),
    info: (message, attributes) => log("info", message, attributes),
    warn: (message, attributes) => log("warn", message, attributes),
  };
}
