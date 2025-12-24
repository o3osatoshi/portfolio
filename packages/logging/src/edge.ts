/**
 * @packageDocumentation
 * Edge runtime logging helpers for sending structured logs and metrics to Axiom.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/edge`.
 */

import { createAxiomTransport } from "./core/axiom";
import { createLogger } from "./core/logger";
import { createNoopLogger } from "./core/noop";
import { createTraceContext } from "./core/trace";
import type {
  Attributes,
  Logger,
  RequestContext,
  RequestLogger,
  RuntimeLoggingOptions,
  Transport,
} from "./types";

type EdgeState = {
  attributes: Attributes;
  logger: Logger;
  options: RuntimeLoggingOptions;
  transport: Transport;
};

let edgeState: EdgeState | undefined;

/**
 * Return the process-level Edge logger initialized by {@link initEdgeLogger}.
 *
 * @remarks
 * Returns a no-op logger until initialization completes.
 *
 * @public
 */
export function createEdgeLogger(): Logger {
  if (!edgeState) {
    return createNoopLogger();
  }
  return edgeState.logger;
}

/**
 * Initialize the Edge logger with Axiom transport.
 *
 * @remarks
 * This function is idempotent; subsequent calls are ignored.
 *
 * @public
 */
export function initEdgeLogger(options: RuntimeLoggingOptions): void {
  if (edgeState) return;

  const transport = createAxiomTransport({
    mode: "immediate",
    token: options.client.token,
    ...(options.client.orgId ? { orgId: options.client.orgId } : {}),
    ...(options.client.url ? { url: options.client.url } : {}),
    ...(options.onError ? { onError: options.onError } : {}),
  });

  const attributes: Attributes = {
    "service.name": options.service,
    "deployment.environment": options.env,
  };

  const logger = createLogger({
    attributes,
    datasets: options.datasets,
    transport,
    ...(options.minLevel !== undefined ? { minLevel: options.minLevel } : {}),
    ...(options.sampleRate !== undefined
      ? { sampleRate: options.sampleRate }
      : {}),
  });

  edgeState = {
    attributes,
    logger,
    options,
    transport,
  };
}

/**
 * Flush buffered logs and reset the Edge logger state.
 *
 * @public
 */
export async function shutdownEdgeLogger(): Promise<void> {
  if (!edgeState) return;
  await edgeState.transport.flush?.();
  edgeState = undefined;
}

/**
 * Run a handler with request-scoped logging context.
 *
 * @remarks
 * Flushes the request logger by default after the handler settles.
 *
 * @public
 */
export async function withRequestLogger<T>(
  ctx: RequestContext,
  handler: (logger: RequestLogger) => Promise<T> | T,
): Promise<T> {
  const requestLogger = createRequestLogger(ctx);

  try {
    return await handler(requestLogger);
  } finally {
    if (edgeState?.options.flushOnEnd ?? true) {
      await requestLogger.flush();
    }
  }
}

function createRequestLogger(ctx: RequestContext): RequestLogger {
  const traceContext = createTraceContext({
    spanId: ctx.spanId,
    traceId: ctx.traceId,
    traceparent: ctx.traceparent,
  });

  const attributes: Attributes = {
    ...(edgeState?.attributes ?? {}),
    "enduser.id": ctx.userId ?? undefined,
    "request.id": ctx.requestId,
    span_id: traceContext.spanId,
    trace_id: traceContext.traceId,
    "client.address": ctx.clientIp,
    "http.method": ctx.httpMethod,
    "http.route": ctx.httpRoute,
    "user_agent.original": ctx.userAgent,
  };

  if (traceContext.parentSpanId) {
    attributes["parent_span_id"] = traceContext.parentSpanId;
  }

  const logger = edgeState
    ? createLogger({
        attributes,
        datasets: edgeState.options.datasets,
        transport: edgeState.transport,
        ...(edgeState.options.minLevel !== undefined
          ? { minLevel: edgeState.options.minLevel }
          : {}),
        ...(edgeState.options.sampleRate !== undefined
          ? { sampleRate: edgeState.options.sampleRate }
          : {}),
      })
    : createNoopLogger();

  const setUserId: RequestLogger["setUserId"] = (userId) => {
    attributes["enduser.id"] = userId ?? undefined;
  };

  const requestLogger: RequestLogger = {
    flush: () => logger.flush(),
    logger,
    setUserId,
    spanId: traceContext.spanId,
    traceId: traceContext.traceId,
  };

  if (traceContext.parentSpanId) {
    requestLogger.parentSpanId = traceContext.parentSpanId;
  }
  if (ctx.requestId) {
    requestLogger.requestId = ctx.requestId;
  }

  return requestLogger;
}
