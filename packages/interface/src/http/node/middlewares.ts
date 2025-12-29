import type { MiddlewareHandler } from "hono";

import type { RequestLogger } from "@o3osatoshi/logging";
import { withRequestLogger } from "@o3osatoshi/logging/node";

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

function emitRequestSummary(
  requestLogger: RequestLogger,
  status: number,
  durationMs: number,
  error?: unknown,
) {
  const attributes = {
    "http.response.duration_ms": Math.max(0, durationMs),
    "http.status_code": status,
  };

  if (error) {
    requestLogger.logger.error("http_request_error", attributes, error);
  } else {
    requestLogger.logger.info("http_request", attributes);
  }

  requestLogger.logger.metric(
    "http.server.requests",
    1,
    { "http.status_code": status },
    { kind: "counter", unit: "1" },
  );
  requestLogger.logger.metric(
    "http.server.request.duration",
    Math.max(0, durationMs),
    { "http.status_code": status },
    { kind: "histogram", unit: "ms" },
  );
}
