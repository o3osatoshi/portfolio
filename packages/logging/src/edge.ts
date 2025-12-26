/**
 * @packageDocumentation
 * Edge runtime logging helpers for sending structured logs and metrics via
 * Axiom or a custom transport.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/edge`.
 */

import { createAxiomTransport } from "./axiom";
import { createLogger } from "./core/logger";
import { createNoopLogger } from "./core/noop";
import { createTraceContext } from "./core/trace";
import { createProxyHandler, type ProxyHandlerOptions } from "./proxy";
import type {
  Attributes,
  Logger,
  RequestContext,
  RequestLogger,
  RuntimeLoggerOptions,
  Transport,
} from "./types";

type EdgeState = {
  attributes: Attributes;
  logger: Logger;
  options: RuntimeLoggerOptions;
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
 * Create a proxy handler that emits events using the initialized Edge logger.
 *
 * @remarks
 * Call {@link initEdgeLogger} before creating the handler.
 * When `allowDatasets` is omitted, the configured datasets are allowed.
 *
 * @public
 */
export function createEdgeProxyHandler(
  options: Omit<ProxyHandlerOptions, "transport"> = {},
): ReturnType<typeof createProxyHandler> {
  if (!edgeState) {
    throw new Error(
      "initEdgeLogger must be called before createEdgeProxyHandler",
    );
  }

  const allowDatasets =
    options.allowDatasets ?? Object.values(edgeState.options.datasets);

  return createProxyHandler({
    ...options,
    allowDatasets,
    transport: edgeState.transport,
  });
}

/**
 * Initialize the Edge logger with a custom transport or Axiom transport.
 *
 * @remarks
 * This function is idempotent; subsequent calls are ignored.
 *
 * @throws
 * Throws when neither `client` nor `transport` is provided.
 *
 * @public
 */
export function initEdgeLogger(options: RuntimeLoggerOptions): void {
  if (edgeState) return;

  const transport = resolveTransport(options);

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
 * Disable by setting `flushOnEnd: false`.
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

  const requestSampleRate = resolveRequestSampleRate(
    edgeState?.options.sampleRate,
  );

  const logger = edgeState
    ? createLogger({
        attributes,
        datasets: edgeState.options.datasets,
        transport: edgeState.transport,
        ...(edgeState.options.minLevel !== undefined
          ? { minLevel: edgeState.options.minLevel }
          : {}),
        ...(requestSampleRate !== undefined
          ? { sampleRate: requestSampleRate }
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

function resolveRequestSampleRate(
  sampleRate: number | undefined,
): number | undefined {
  if (sampleRate === undefined) return undefined;
  if (sampleRate >= 1) return 1;
  if (sampleRate <= 0) return 0;
  return Math.random() <= sampleRate ? 1 : 0;
}

function resolveTransport(options: RuntimeLoggerOptions): Transport {
  if (options.transport) {
    return options.transport;
  }

  if (!options.client) {
    throw new Error("client or transport is required to initialize logging");
  }

  const { onError: clientOnError, ...clientOptions } = options.client;
  const onError = options.onError ?? clientOnError;
  return createAxiomTransport({
    ...clientOptions,
    mode: "immediate",
    ...(onError ? { onError } : {}),
  });
}
