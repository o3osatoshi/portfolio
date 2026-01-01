import type { z } from "zod";

import type { Attributes, Logger } from "@o3osatoshi/logging";
import { parseErrorName } from "@o3osatoshi/toolkit";

import type {
  SmartFetchClient,
  SmartFetchRequest,
  SmartFetchRequestMeta,
} from "./smart-fetch-types";

export type SmartFetchMetricsOptions = {
  logger?: Logger | undefined;
  redactUrl?: (url: string) => string;
  requestName?: string;
};

export function withMetrics(
  next: SmartFetchClient,
  options: SmartFetchMetricsOptions = {},
): SmartFetchClient {
  if (!options.logger) {
    return next;
  }

  const logger = options.logger;
  const redactUrl = options.redactUrl ?? ((url: string) => url);
  const requestName = options.requestName;

  return <S extends z.ZodType>(request: SmartFetchRequest<S>) => {
    const startedAt = Date.now();
    return next(request)
      .map((result) => {
        const durationMs = Math.max(0, Date.now() - startedAt);
        emitMetrics({
          durationMs,
          logger,
          redactUrl,
          request,
          requestName,
          result,
        });
        return result;
      })
      .mapErr((error) => {
        const durationMs = Math.max(0, Date.now() - startedAt);
        emitMetrics({
          durationMs,
          error,
          logger,
          redactUrl,
          request,
          requestName,
        });
        return error;
      });
  };
}

function buildAttributes({
  error,
  redactUrl,
  request,
  requestName,
  result,
}: {
  error?: Error | undefined;
  redactUrl: (url: string) => string;
  request: SmartFetchRequestMeta;
  requestName?: string | undefined;
  result?:
    | {
        cached: boolean;
        meta?: { attempts?: number; cacheHit?: boolean };
        response?: { status?: number } | undefined;
      }
    | undefined;
}): Attributes {
  const { kind, layer } = error ? parseErrorName(error.name) : {};
  const attempts =
    result?.meta?.attempts ??
    (error as { retryAttempts?: number } | undefined)?.retryAttempts;

  return {
    ...(requestName ? { "http.request.name": requestName } : {}),
    "cache.hit": result?.meta?.cacheHit,
    "http.method": (request.method ?? "GET").toUpperCase(),
    "http.status_code": result?.response?.status,
    "http.url": redactUrl(request.url),
    "retry.attempts": attempts,
    ...(kind ? { "error.kind": kind } : {}),
    ...(layer ? { "error.layer": layer } : {}),
  };
}

function emitMetrics({
  durationMs,
  error,
  logger,
  redactUrl,
  request,
  requestName,
  result,
}: {
  durationMs: number;
  error?: Error;
  logger: Logger;
  redactUrl: (url: string) => string;
  request: SmartFetchRequestMeta;
  requestName?: string | undefined;
  result?:
    | {
        cached: boolean;
        meta?: { attempts?: number };
        response?: { status?: number } | undefined;
      }
    | undefined;
}) {
  const attributes = buildAttributes({
    error,
    redactUrl,
    request,
    requestName,
    result,
  });

  logger.metric("http.client.requests", 1, attributes, {
    kind: "counter",
    unit: "1",
  });
  logger.metric("http.client.request.duration", durationMs, attributes, {
    kind: "histogram",
    unit: "ms",
  });
}
