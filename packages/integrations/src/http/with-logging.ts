import type { z } from "zod";

import type { Attributes, Logger } from "@o3osatoshi/logging";
import type { RichError } from "@o3osatoshi/toolkit";

import type {
  SmartFetch,
  SmartFetchRequest,
  SmartFetchResponse,
} from "./types";

export type SmartFetchLoggingOptions = {
  logger: Logger;
};

export type SmartFetchRequestLoggingOptions = {
  redactUrl?: (url: string) => string;
  requestName?: string;
};

export function withLogging(
  next: SmartFetch,
  options: SmartFetchLoggingOptions,
): SmartFetch {
  const logger = options.logger;

  return <S extends z.ZodType>(request: SmartFetchRequest<S>) => {
    const redactUrl =
      request.logging?.redactUrl === undefined
        ? (url: string) => url
        : request.logging.redactUrl;
    const requestName = request.logging?.requestName;
    const startedAt = Date.now();

    return next(request)
      .map((res) => {
        const durationMs = Math.max(0, Date.now() - startedAt);

        emitMetrics({
          durationMs,
          logger,
          redactUrl,
          request,
          requestName,
          response: res,
        });

        if (!res.response.ok) {
          const attributes = buildAttributes(
            request,
            res,
            redactUrl,
            requestName,
          );
          if (res.response.status >= 500) {
            logger.error("http_client_error", attributes);
          } else {
            logger.warn("http_client_warn", attributes);
          }
        }

        return res;
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

        const attributes = buildErrorAttributes(
          request,
          error,
          redactUrl,
          requestName,
        );
        const level = resolveErrorLevel(error);
        if (level === "error") {
          logger.error("http_client_error", attributes, error);
        } else {
          logger.warn("http_client_warn", attributes);
        }

        return error;
      });
  };
}

function buildAttributes<S extends z.ZodType>(
  request: SmartFetchRequest<S>,
  response: SmartFetchResponse,
  redactUrl: (url: string) => string,
  requestName?: string,
): Attributes {
  return {
    ...(requestName ? { "http.request.name": requestName } : {}),
    "cache.hit": response.cache?.hit,
    "http.method": (request.method ?? "GET").toUpperCase(),
    "http.status_code": response.response.status,
    "http.url": redactUrl(request.url),
    "retry.attempts": response.retry?.attempts,
  };
}

function buildErrorAttributes<S extends z.ZodType>(
  request: SmartFetchRequest<S>,
  error: RichError,
  redactUrl: (url: string) => string,
  requestName?: string,
): Attributes {
  return {
    ...(requestName ? { "http.request.name": requestName } : {}),
    "error.name": error.name,
    "error.kind": error.kind,
    "error.layer": error.layer,
    "error.message": error.message,
    "http.method": (request.method ?? "GET").toUpperCase(),
    "http.url": redactUrl(request.url),
  };
}

function buildMetricsAttributes<S extends z.ZodType>({
  error,
  redactUrl,
  request,
  requestName,
  response,
}: {
  error?: RichError | undefined;
  redactUrl: (url: string) => string;
  request: SmartFetchRequest<S>;
  requestName?: string | undefined;
  response?: SmartFetchResponse | undefined;
}): Attributes {
  const kind = error?.kind;
  const layer = error?.layer;
  return {
    ...(requestName ? { "http.request.name": requestName } : {}),
    ...(kind ? { "error.kind": kind } : {}),
    ...(layer ? { "error.layer": layer } : {}),
    "cache.hit": response?.cache?.hit,
    "http.method": (request.method ?? "GET").toUpperCase(),
    "http.status_code": response?.response?.status,
    "http.url": redactUrl(request.url),
    "retry.attempts": response?.retry?.attempts,
  };
}

function emitMetrics<S extends z.ZodType>({
  durationMs,
  error,
  logger,
  redactUrl,
  request,
  requestName,
  response,
}: {
  durationMs: number;
  error?: RichError;
  logger: Logger;
  redactUrl: (url: string) => string;
  request: SmartFetchRequest<S>;
  requestName?: string | undefined;
  response?: SmartFetchResponse;
}) {
  const attributes = buildMetricsAttributes({
    error,
    redactUrl,
    request,
    requestName,
    response,
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

function resolveErrorLevel(error: RichError): "error" | "warn" {
  const kind = error.kind;
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
