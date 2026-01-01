import type { z } from "zod";

import type { Attributes, Logger } from "@o3osatoshi/logging";
import { parseErrorName } from "@o3osatoshi/toolkit";

import type {
  SmartFetchClient,
  SmartFetchRequest,
  SmartFetchRequestMeta,
} from "./smart-fetch-types";

export type SmartFetchEventsOptions = {
  logger?: Logger | undefined;
  redactUrl?: (url: string) => string;
  requestName?: string;
};

export function withEvents(
  next: SmartFetchClient,
  options: SmartFetchEventsOptions = {},
): SmartFetchClient {
  if (!options.logger) {
    return next;
  }

  const logger = options.logger;
  const redactUrl = options.redactUrl ?? ((url: string) => url);
  const requestName = options.requestName;

  return <S extends z.ZodType>(request: SmartFetchRequest<S>) =>
    next(request)
      .map((result) => {
        const response = result.response;
        if (response && !response.ok) {
          const attrs = buildAttributes(
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
        const attrs = buildErrorAttributes(
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
}

function buildAttributes(
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

function buildErrorAttributes(
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
