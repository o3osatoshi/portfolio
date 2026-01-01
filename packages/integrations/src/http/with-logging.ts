import type { z } from "zod";

import type { Attributes, Logger } from "@o3osatoshi/logging";
import { parseErrorName } from "@o3osatoshi/toolkit";

import type {
  SmartFetch,
  SmartFetchRequest,
  SmartFetchRequestMeta,
} from "./smart-fetch-types";

export type SmartFetchLoggingOptions = {
  logger?: Logger | undefined;
  redactUrl?: (url: string) => string;
  requestName?: string;
};

export function withLogging(
  next: SmartFetch,
  options: SmartFetchLoggingOptions = {},
): SmartFetch {
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

        // Emit metrics
        emitMetrics({
          durationMs,
          logger,
          redactUrl,
          request,
          requestName,
          result,
        });

        // Log events for non-ok responses
        const response = result.response;
        if (response && !response.ok) {
          const attrs = buildEventAttributes(
            request,
            result,
            redactUrl,
            requestName,
          );
          if (response.status >= 500) {
            logger.error("http_client_error", attrs);
          } else {
            logger.warn("http_client_error", attrs);
          }
        }

        return result;
      })
      .mapErr((error) => {
        const durationMs = Math.max(0, Date.now() - startedAt);

        // Emit metrics
        emitMetrics({
          durationMs,
          error,
          logger,
          redactUrl,
          request,
          requestName,
        });

        // Log error events
        const attrs = buildErrorEventAttributes(
          request,
          error,
          redactUrl,
          requestName,
        );
        const level = resolveErrorLevel(error);
        if (level === "error") {
          logger.error("http_client_error", attrs, error);
        } else {
          logger.warn("http_client_error", attrs);
        }

        return error;
      });
  };
}

function buildErrorEventAttributes(
  request: SmartFetchRequestMeta,
  error: Error,
  redactUrl: (url: string) => string,
  requestName?: string,
): Attributes {
  const { kind, layer } = parseErrorName(error.name);
  const attempts =
    (error as { retryAttempts?: number }).retryAttempts ?? undefined;

  return {
    ...(requestName ? { "http.request.name": requestName } : {}),
    "http.method": (request.method ?? "GET").toUpperCase(),
    "http.url": redactUrl(request.url),
    ...(kind ? { "error.kind": kind } : {}),
    ...(layer ? { "error.layer": layer } : {}),
    "error.name": error.name,
    "error.message": error.message,
    "retry.attempts": attempts,
  };
}

function buildEventAttributes(
  request: SmartFetchRequestMeta,
  result: {
    cached: boolean;
    meta?: { attempts?: number; cacheHit?: boolean };
    response?: { status?: number } | undefined;
  },
  redactUrl: (url: string) => string,
  requestName?: string,
): Attributes {
  return {
    ...(requestName ? { "http.request.name": requestName } : {}),
    "cache.hit": result.meta?.cacheHit,
    "http.method": (request.method ?? "GET").toUpperCase(),
    "http.status_code": result.response?.status,
    "http.url": redactUrl(request.url),
    "retry.attempts": result.meta?.attempts,
  };
}

function buildMetricsAttributes({
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
  const attributes = buildMetricsAttributes({
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

function resolveErrorLevel(error: Error): "error" | "warn" {
  const { kind } = parseErrorName(error.name);
  if (!kind) return "error";
  if (
    kind === "BadRequest" ||
    kind === "Validation" ||
    kind === "NotFound" ||
    kind === "Unauthorized" ||
    kind === "Forbidden" ||
    kind === "RateLimit"
  ) {
    return "warn";
  }
  return "error";
}
