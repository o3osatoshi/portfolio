/**
 * @packageDocumentation
 * Node.js logging helpers for sending structured logs and metrics to Axiom.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/node`.
 */

import { AsyncLocalStorage } from "node:async_hooks";

import { createAxiomTransport } from "./core/axiom";
import { createLogger } from "./core/logger";
import { createNoopLogger } from "./core/noop";
import { createTraceContext } from "./core/trace";
import type {
  Attributes,
  Logger,
  NodeLoggingOptions,
  RequestContext,
  RequestLogger,
  Transport,
} from "./types";

type NodeState = {
  base: Attributes;
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
 * Initialize the Node.js logger with Axiom transport.
 *
 * @remarks
 * This function is idempotent; subsequent calls are ignored.
 *
 * @public
 */
export function initNodeLogger(options: NodeLoggingOptions): void {
  if (nodeState) return;

  const transport = createAxiomTransport({
    mode: "batch",
    token: options.axiom.token,
    ...(options.axiom.orgId ? { orgId: options.axiom.orgId } : {}),
    ...(options.axiom.url ? { url: options.axiom.url } : {}),
    ...(options.onError ? { onError: options.onError } : {}),
  });

  const base: Attributes = {
    "service.name": options.service,
    "deployment.environment": options.env,
  };

  const logger = createLogger({
    base,
    datasets: options.datasets,
    transport,
    ...(options.minLevel !== undefined ? { minLevel: options.minLevel } : {}),
    ...(options.sampleRate !== undefined
      ? { sampleRate: options.sampleRate }
      : {}),
  });

  nodeState = {
    base,
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
  const trace = createTraceContext({
    spanId: ctx.spanId,
    traceId: ctx.traceId,
    traceparent: ctx.traceparent,
  });

  const base: Attributes = {
    ...(nodeState?.base ?? {}),
    "enduser.id": ctx.userId ?? undefined,
    "request.id": ctx.requestId,
    span_id: trace.spanId,
    trace_id: trace.traceId,
    "client.address": ctx.clientIp,
    "http.method": ctx.httpMethod,
    "http.route": ctx.httpRoute,
    "user_agent.original": ctx.userAgent,
  };

  if (trace.parentSpanId) {
    base["parent_span_id"] = trace.parentSpanId;
  }

  const logger = nodeState
    ? createLogger({
        base,
        datasets: nodeState.options.datasets,
        transport: nodeState.transport,
        ...(nodeState.options.minLevel !== undefined
          ? { minLevel: nodeState.options.minLevel }
          : {}),
        ...(nodeState.options.sampleRate !== undefined
          ? { sampleRate: nodeState.options.sampleRate }
          : {}),
      })
    : createNoopLogger();

  const setUserId: RequestLogger["setUserId"] = (userId) => {
    base["enduser.id"] = userId ?? undefined;
  };

  const requestLogger: RequestLogger = {
    flush: () => logger.flush(),
    logger,
    setUserId,
    spanId: trace.spanId,
    traceId: trace.traceId,
  };

  if (trace.parentSpanId) {
    requestLogger.parentSpanId = trace.parentSpanId;
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
