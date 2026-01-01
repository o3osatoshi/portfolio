import { type Result, ResultAsync } from "neverthrow";

import { parseErrorName } from "@o3osatoshi/toolkit";

import type {
  SmartFetchClient,
  SmartFetchRequest,
  SmartFetchRequestMeta,
  SmartFetchResponse,
} from "./smart-fetch-types";
import { mergeMeta } from "./smart-fetch-types";

export type SmartFetchRetryOptions = {
  baseDelayMs?: number;
  maxAttempts?: number;
  maxDelayMs?: number;
  respectRetryAfter?: boolean;
  retryOnMethods?: string[];
  retryOnStatuses?: number[];
  shouldRetry?: (input: RetryCheckInput) => boolean;
};

type RetryCheckInput = {
  attempt: number;
  error?: Error;
  maxAttempts: number;
  request: SmartFetchRequestMeta;
  response?: { headers?: Headers; status?: number } | undefined;
};

const DEFAULT_RETRY_METHODS = ["GET", "HEAD", "OPTIONS"];
const DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504];

export function withRetry(
  next: SmartFetchClient,
  options: SmartFetchRetryOptions = {},
): SmartFetchClient {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const baseDelayMs = options.baseDelayMs ?? 200;
  const maxDelayMs = options.maxDelayMs ?? 2000;
  const retryOnMethods = (options.retryOnMethods ?? DEFAULT_RETRY_METHODS).map(
    (m) => m.toUpperCase(),
  );
  const retryOnStatuses = options.retryOnStatuses ?? DEFAULT_RETRY_STATUSES;
  const respectRetryAfter = options.respectRetryAfter ?? true;
  const shouldRetry =
    options.shouldRetry ??
    ((input) =>
      defaultShouldRetry({
        input,
        retryOnMethods,
        retryOnStatuses,
      }));

  return <T>(request: SmartFetchRequest<T>) =>
    ResultAsync.fromPromise(
      (async () => {
        let attempt = 0;
        let lastError: Error | undefined;
        let lastResponse: Result<SmartFetchResponse<T>, Error> | undefined;

        while (attempt < maxAttempts) {
          attempt += 1;
          const result = await next(request);
          if (result.isOk()) {
            lastResponse = result;
            const responseMeta = result.value.response;
            const shouldRetryResponse = shouldRetry({
              attempt,
              maxAttempts,
              request,
              response: responseMeta,
            });
            if (!shouldRetryResponse || attempt >= maxAttempts) {
              return {
                ...result.value,
                meta: mergeMeta(result.value.meta, { attempts: attempt }),
              };
            }

            const retryAfterMs = respectRetryAfter
              ? resolveRetryAfterMs(responseMeta)
              : undefined;
            const delayMs = resolveDelayMs({
              attempt,
              baseDelayMs,
              maxDelayMs,
              retryAfterMs,
            });
            await sleep(delayMs);
            continue;
          }

          lastError = result.error;
          const shouldRetryError = shouldRetry({
            attempt,
            error: result.error,
            maxAttempts,
            request,
          });
          if (!shouldRetryError || attempt >= maxAttempts) {
            throw attachRetryAttempts(result.error, attempt);
          }

          const delayMs = resolveDelayMs({
            attempt,
            baseDelayMs,
            maxDelayMs,
          });
          await sleep(delayMs);
        }

        if (lastResponse?.isOk()) {
          return {
            ...lastResponse.value,
            meta: mergeMeta(lastResponse.value.meta, { attempts: attempt }),
          };
        }

        throw attachRetryAttempts(
          lastError ?? new Error("Retry attempts exhausted"),
          attempt,
        );
      })(),
      (cause) => (cause instanceof Error ? cause : new Error(String(cause))),
    );
}

function attachRetryAttempts(error: Error, attempts: number) {
  try {
    (error as { retryAttempts?: number }).retryAttempts = attempts;
  } catch {
    return error;
  }
  return error;
}

function defaultShouldRetry({
  input,
  retryOnMethods,
  retryOnStatuses,
}: {
  input: RetryCheckInput;
  retryOnMethods: string[];
  retryOnStatuses: number[];
}) {
  if (input.attempt >= input.maxAttempts) return false;
  const method = (input.request.method ?? "GET").toUpperCase();
  if (!retryOnMethods.includes(method)) return false;

  if (input.error) {
    return isRetryableError(input.error);
  }

  const status = input.response?.status;
  if (status === undefined) return false;
  return retryOnStatuses.includes(status);
}

function isRetryableError(error: Error): boolean {
  const { kind } = parseErrorName(error.name);
  if (!kind) return false;
  return (
    kind === "Timeout" ||
    kind === "Unavailable" ||
    kind === "RateLimit" ||
    kind === "BadGateway"
  );
}

function resolveDelayMs({
  attempt,
  baseDelayMs,
  maxDelayMs,
  retryAfterMs,
}: {
  attempt: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryAfterMs?: number | undefined;
}) {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
  const jitter = Math.random() * exponential;
  if (retryAfterMs === undefined) return jitter;
  return Math.min(maxDelayMs, Math.max(jitter, retryAfterMs));
}

function resolveRetryAfterMs(response?: { headers?: Headers }) {
  const header = response?.headers?.get("retry-after");
  if (!header) return undefined;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) {
    return Math.max(0, seconds * 1000);
  }
  const dateMs = Date.parse(header);
  if (Number.isNaN(dateMs)) return undefined;
  return Math.max(0, dateMs - Date.now());
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
