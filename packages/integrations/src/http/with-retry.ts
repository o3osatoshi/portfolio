import { type Result, ResultAsync } from "neverthrow";
import type { z } from "zod";

import {
  type JsonObject,
  newRichError,
  type RichError,
  sleep,
  toRichError,
} from "@o3osatoshi/toolkit";

import { newIntegrationError } from "../integration-error";
import { integrationErrorCodes } from "../integration-error-catalog";
import type {
  SmartFetch,
  SmartFetchRequest,
  SmartFetchResponse,
} from "./types";

/**
 * Per-request retry override options merged with global defaults.
 *
 * When supplied, `shouldRetry` receives request/attempt/response/error context
 * and can fully control retry decisions.
 *
 * @public
 */
export type SmartFetchRequestRetryOptions<S extends z.ZodType> = {
  shouldRetry?: (input: RetryCheckInput<S>) => boolean;
} & SmartFetchRetryOptions;

/**
 * Shared retry options for `createSmartFetch` and per-request overrides.
 *
 * - Exponential backoff defaults are applied when values are omitted.
 * - Retry is only attempted for configured methods and status codes
 *   unless `shouldRetry` is overridden.
 *
 * @public
 */
export type SmartFetchRetryOptions = {
  baseDelayMs?: number;
  maxAttempts?: number;
  maxDelayMs?: number;
  respectRetryAfter?: boolean;
  retryOnMethods?: string[];
  retryOnStatuses?: number[];
};

type RetryCheckInput<S extends z.ZodType> = {
  attempts: number;
  error?: RichError;
  maxAttempts: number;
  request: SmartFetchRequest<S>;
  response?: SmartFetchResponse<z.infer<S>> | undefined;
};

type RetryMeta = {
  attempts: number;
  exhausted: boolean;
  maxAttempts: number;
  method: string;
  retryable: boolean;
};

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 200;
const MAX_DELAY_MS = 2000;
const RETRY_ON_METHODS = ["GET", "HEAD", "OPTIONS"];
const RETRY_ON_STATUSES = [408, 429, 500, 502, 503, 504];
const RESPECT_RETRY_AFTER = true;

/**
 * Compose retry behavior around a `SmartFetch` request.
 *
 * Retry is attempted when:
 * - HTTP status is in `retryOnStatuses` and request method is allowed
 * - or `shouldRetry` returns `true` for custom logic
 * - or error is of retryable kind (`Timeout`, `Unavailable`, `RateLimit`, `BadGateway`)
 *
 * Final state metadata is attached to `error.meta.retry`:
 * `attempts`, `exhausted`, `maxAttempts`, `method`, `retryable`.
 *
 * @param next Underlying smart-fetch function.
 * @param options Global retry policy defaults.
 * @returns Smart-fetch function with retry logic.
 * @public
 */
export function withRetry(
  next: SmartFetch,
  options: SmartFetchRetryOptions = {},
): SmartFetch {
  return <S extends z.ZodType>(request: SmartFetchRequest<S>) => {
    let attempts = 0;
    const maxAttempts = Math.max(
      MAX_ATTEMPTS,
      request.retry?.maxAttempts ?? options.maxAttempts ?? 1,
    );
    const method = (request.method ?? "GET").toUpperCase();

    return ResultAsync.fromPromise(
      (async () => {
        const retry = request.retry ?? {};
        const baseDelayMs =
          retry?.baseDelayMs ?? options.baseDelayMs ?? BASE_DELAY_MS;
        const maxDelayMs =
          retry?.maxDelayMs ?? options.maxDelayMs ?? MAX_DELAY_MS;
        const retryOnMethods = (
          retry.retryOnMethods ??
          options.retryOnMethods ??
          RETRY_ON_METHODS
        ).map((m) => m.toUpperCase());
        const retryOnStatuses =
          retry.retryOnStatuses ?? options.retryOnStatuses ?? RETRY_ON_STATUSES;
        const respectRetryAfter =
          retry.respectRetryAfter ??
          options.respectRetryAfter ??
          RESPECT_RETRY_AFTER;
        const shouldRetry =
          retry.shouldRetry ??
          ((input: RetryCheckInput<S>) =>
            defaultShouldRetry({
              input,
              retryOnMethods,
              retryOnStatuses,
            }));

        let lastError: RichError | undefined;
        let lastResult:
          | Result<SmartFetchResponse<z.infer<S>>, RichError>
          | undefined;

        while (attempts < maxAttempts) {
          attempts += 1;
          const result = await next(request);
          if (result.isOk()) {
            lastResult = result;
            const response = result.value;
            const shouldRetryResponse = shouldRetry({
              attempts,
              maxAttempts,
              request,
              response,
            });
            if (!shouldRetryResponse || attempts >= maxAttempts) {
              return {
                ...result.value,
                retry: { attempts },
              };
            }

            const retryAfterMs = respectRetryAfter
              ? resolveRetryAfterMs(response)
              : undefined;
            const delayMs = resolveDelayMs({
              attempts: attempts,
              baseDelayMs,
              maxDelayMs,
              retryAfterMs,
            });
            await sleep(delayMs);
            continue;
          }

          lastError = result.error;
          const shouldRetryError = shouldRetry({
            attempts,
            error: result.error,
            maxAttempts,
            request,
          });
          if (!shouldRetryError || attempts >= maxAttempts) {
            throw enrichRetryError(result.error, {
              attempts,
              exhausted: attempts >= maxAttempts,
              maxAttempts,
              method,
              retryable: shouldRetryError,
            });
          }

          const delayMs = resolveDelayMs({
            attempts: attempts,
            baseDelayMs,
            maxDelayMs,
          });
          await sleep(delayMs);
        }

        if (lastResult?.isOk()) {
          return {
            ...lastResult.value,
            retry: { attempts },
          };
        }

        if (lastError) {
          throw enrichRetryError(lastError, {
            attempts,
            exhausted: true,
            maxAttempts,
            method,
            retryable: false,
          });
        }

        throw newIntegrationError({
          code: integrationErrorCodes.EXTERNAL_RETRY_EXHAUSTED,
          details: {
            action: "RetryExternalApi",
            reason: `Retry attempts exhausted (attempts: ${attempts}).`,
          },
          isOperational: false,
          kind: "Internal",
          meta: {
            retry: {
              attempts,
              exhausted: true,
              maxAttempts,
              method,
              retryable: false,
            },
          },
        });
      })(),
      (error) =>
        toRichError(error, {
          details: {
            action: "RetryExternalApi",
            reason: `Retry failed with an unexpected error value (attempts: ${attempts}).`,
          },
          kind: "Internal",
          layer: "External",
          meta: {
            retry: {
              attempts,
              exhausted: attempts >= maxAttempts,
              maxAttempts,
              method,
              retryable: false,
            },
          },
        }),
    );
  };
}

function defaultShouldRetry<S extends z.ZodType>({
  input,
  retryOnMethods,
  retryOnStatuses,
}: {
  input: RetryCheckInput<S>;
  retryOnMethods: string[];
  retryOnStatuses: number[];
}) {
  if (input.attempts >= input.maxAttempts) return false;

  const method = (input.request.method ?? "GET").toUpperCase();
  if (!retryOnMethods.includes(method)) return false;

  if (input.error) {
    return isRetryableError(input.error);
  }

  const status = input.response?.response.status;
  if (status === undefined) return false;
  return retryOnStatuses.includes(status);
}

function enrichRetryError(error: RichError, retry: RetryMeta): RichError {
  const richError = newRichError({
    cause: error.cause,
    code: error.code,
    details: error.details,
    i18n: error.i18n,
    isOperational: error.isOperational,
    kind: error.kind,
    layer: error.layer,
    meta: mergeRetryMeta(error.meta, retry),
  });
  richError.message = error.message;
  if (error.stack !== undefined) {
    richError.stack = error.stack;
  }
  return richError;
}

function isRetryableError(error: RichError): boolean {
  const kind = error.kind;
  if (!kind) return false;
  return (
    kind === "Timeout" ||
    kind === "Unavailable" ||
    kind === "RateLimit" ||
    kind === "BadGateway"
  );
}

function mergeRetryMeta(
  meta: JsonObject | undefined,
  retry: RetryMeta,
): JsonObject {
  const currentRetry =
    meta &&
    typeof meta["retry"] === "object" &&
    meta["retry"] !== null &&
    !Array.isArray(meta["retry"])
      ? (meta["retry"] as Record<string, unknown>)
      : undefined;

  return {
    ...(meta ?? {}),
    retry: {
      ...(currentRetry ?? {}),
      attempts: retry.attempts,
      exhausted: retry.exhausted,
      maxAttempts: retry.maxAttempts,
      method: retry.method,
      retryable: retry.retryable,
    },
  };
}

function resolveDelayMs({
  attempts,
  baseDelayMs,
  maxDelayMs,
  retryAfterMs,
}: {
  attempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryAfterMs?: number | undefined;
}) {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempts - 1));
  const jitter = Math.random() * exponential;
  if (retryAfterMs === undefined) return jitter;
  return Math.min(maxDelayMs, Math.max(jitter, retryAfterMs));
}

function resolveRetryAfterMs(response: SmartFetchResponse) {
  const retryAfter = response.response.headers?.get("retry-after");
  if (!retryAfter) return undefined;

  const retryAfterNumber = Number(retryAfter);
  if (!Number.isNaN(retryAfterNumber)) {
    return Math.max(0, retryAfterNumber * 1000);
  }

  const retryAfterDate = Date.parse(retryAfter);
  if (Number.isNaN(retryAfterDate)) return undefined;
  return Math.max(0, retryAfterDate - Date.now());
}
