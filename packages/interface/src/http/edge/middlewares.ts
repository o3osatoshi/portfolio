import type { MiddlewareHandler } from "hono";

import { withRequestLogger } from "@o3osatoshi/logging/edge";

import { emitRequestSummary } from "../core/emit-request";
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

    try {
      await next();
      emitRequestSummary(
        requestLogger,
        c.res?.status ?? 200,
        Date.now() - startedAt,
        c.get("error"),
      );
    } catch (error: unknown) {
      emitRequestSummary(
        requestLogger,
        c.res?.status ?? 500,
        Date.now() - startedAt,
        error,
      );
      throw error;
    }
  });
};
