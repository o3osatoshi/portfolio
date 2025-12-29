import type { MiddlewareHandler } from "hono";

import { withRequestLogger } from "@o3osatoshi/logging/node";

import { emitRequestEnd, emitRequestStart } from "../core/emit-request";
import { buildRequestContext } from "../core/request-context";
import type { ContextEnv } from "../core/types";

export const loggerMiddleware: MiddlewareHandler<ContextEnv> = async (
  c,
  next,
) => {
  const requestContext = buildRequestContext(c);
  const startedAt = Date.now();

  return withRequestLogger(requestContext, async (requestLogger) => {
    c.set("logger", requestLogger.logger);
    c.set("requestLogger", requestLogger);

    emitRequestStart(requestLogger);

    try {
      await next();
      emitRequestEnd(
        requestLogger,
        c.res?.status ?? 200,
        Date.now() - startedAt,
      );
    } catch (error: unknown) {
      emitRequestEnd(
        requestLogger,
        c.res?.status ?? 500,
        Date.now() - startedAt,
        error,
      );
      throw error;
    }
  });
};
