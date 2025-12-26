/**
 * @packageDocumentation
 * Node.js logging helpers for sending structured logs and metrics via Axiom
 * or a custom transport.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/node`.
 */

import { AsyncLocalStorage } from "node:async_hooks";

import { createAxiomTransport } from "./axiom";
import { createLogger } from "./core/logger";
import { createNoopLogger } from "./core/noop";
import { createTraceContext } from "./core/trace";
import { createProxyHandler, type ProxyHandlerOptions } from "./proxy";
import type {
  Attributes,
  Logger,
  NodeLoggingOptions,
  RequestContext,
  RequestLogger,
  Transport,
} from "./types";

type NodeState = {
  attributes: Attributes;
  logger: Logger;
  options: NodeLoggingOptions;
  transport: Transport;
};

const requestStorage = new AsyncLocalStorage<RequestLogger>();

let nodeState: NodeState | undefined;
let hooksRegistered = false;

/**
 * Return the process-level logger initialized by {@link initNodeLogger}.
 *
 * @remarks
 * Returns a no-op logger until initialization completes.
 *
 * @public
 */
export function createNodeLogger(): Logger {
  if (!nodeState) {
    return createNoopLogger();
  }
  return nodeState.logger;
}

/**
 * Create a proxy handler that emits events using the initialized Node logger.
 *
 * @remarks
 * Call {@link initNodeLogger} before creating the handler.
 * When `allowDatasets` is omitted, the configured datasets are allowed.
 *
 * @public
 */
export function createNodeProxyHandler(
  options: Omit<ProxyHandlerOptions, "transport"> = {},
): ReturnType<typeof createProxyHandler> {
  if (!nodeState) {
    throw new Error(
      "initNodeLogger must be called before createNodeProxyHandler",
    );
  }

  const allowDatasets =
    options.allowDatasets ?? Object.values(nodeState.options.datasets);

  return createProxyHandler({
    ...options,
    allowDatasets,
    transport: nodeState.transport,
  });
}

/**
 * Access the active request logger, when running inside {@link withRequestLogger}.
 *
 * @remarks
 * Returns `undefined` when called outside the request context.
 *
 * @public
 */
export function getActiveRequestLogger(): RequestLogger | undefined {
  return requestStorage.getStore();
}

/**
 * Initialize the Node.js logger with a custom transport or Axiom transport.
 *
 * @remarks
 * This function is idempotent; subsequent calls are ignored.
 *
 * @throws
 * Throws when neither `client` nor `transport` is provided.
 *
 * @public
 */
export function initNodeLogger(options: NodeLoggingOptions): void {
  if (nodeState) return;

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

  nodeState = {
    attributes,
    logger,
    options,
    transport,
  };

  if (options.flushOnExit ?? true) {
    registerProcessHooks();
  }
}

/**
 * Flush buffered logs and reset the Node logger state.
 *
 * @public
 */
export async function shutdownNodeLogger(): Promise<void> {
  if (!nodeState) return;
  await nodeState.transport.flush?.();
  nodeState = undefined;
}

/**
 * Run a handler with request-scoped logging context bound to AsyncLocalStorage.
 *
 * @remarks
 * When `flushOnEnd` is enabled, the logger is flushed after the handler settles.
 * Node helpers do not enable this by default.
 *
 * @public
 */
export async function withRequestLogger<T>(
  ctx: RequestContext,
  handler: (logger: RequestLogger) => Promise<T> | T,
): Promise<T> {
  const requestLogger = createRequestLogger(ctx);

  return requestStorage.run(requestLogger, async () => {
    try {
      return await handler(requestLogger);
    } finally {
      if (nodeState?.options.flushOnEnd) {
        await requestLogger.flush();
      }
    }
  });
}

function createRequestLogger(ctx: RequestContext): RequestLogger {
  const traceContext = createTraceContext({
    spanId: ctx.spanId,
    traceId: ctx.traceId,
    traceparent: ctx.traceparent,
  });

  const attributes: Attributes = {
    ...(nodeState?.attributes ?? {}),
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
    nodeState?.options.sampleRate,
  );

  const logger = nodeState
    ? createLogger({
        attributes: attributes,
        datasets: nodeState.options.datasets,
        transport: nodeState.transport,
        ...(nodeState.options.minLevel !== undefined
          ? { minLevel: nodeState.options.minLevel }
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

function registerProcessHooks(): void {
  if (hooksRegistered) return;
  hooksRegistered = true;

  const handler = () => {
    void shutdownNodeLogger();
  };

  process.on("beforeExit", handler);
  process.on("SIGTERM", handler);
  process.on("SIGINT", handler);
}

function resolveRequestSampleRate(
  sampleRate: number | undefined,
): number | undefined {
  if (sampleRate === undefined) return undefined;
  if (sampleRate >= 1) return 1;
  if (sampleRate <= 0) return 0;
  return Math.random() <= sampleRate ? 1 : 0;
}

function resolveTransport(options: NodeLoggingOptions): Transport {
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
    mode: "batch",
    ...(onError ? { onError } : {}),
  });
}
