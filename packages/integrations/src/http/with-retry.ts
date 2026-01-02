import { type Result, ResultAsync } from "neverthrow";
import type { z } from "zod";

import { parseErrorName, sleep } from "@o3osatoshi/toolkit";

import { newIntegrationError } from "../integration-error";
import type {
  SmartFetch,
  SmartFetchRequest,
  SmartFetchResponse,
} from "./types";

export type SmartFetchRequestRetryOptions<S extends z.ZodType> = {
  shouldRetry?: (input: RetryCheckInput<S>) => boolean;
} & SmartFetchRetryOptions;

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
  error?: Error;
  maxAttempts: number;
  request: SmartFetchRequest<S>;
  response?: SmartFetchResponse<z.infer<S>> | undefined;
};

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 200;
const MAX_DELAY_MS = 2000;
const RETRY_ON_METHODS = ["GET", "HEAD", "OPTIONS"];
const RETRY_ON_STATUSES = [408, 429, 500, 502, 503, 504];
const RESPECT_RETRY_AFTER = true;

export function withRetry(
  next: SmartFetch,
  options: SmartFetchRetryOptions = {},
): SmartFetch {
  return <S extends z.ZodType>(request: SmartFetchRequest<S>) => {
    let attempts = 0;

    return ResultAsync.fromPromise(
      (async () => {
        const retry = request.retry ?? {};
        const maxAttempts = Math.max(
          MAX_ATTEMPTS,
          retry?.maxAttempts ?? options.maxAttempts ?? 1,
        );
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

        let lastError: Error | undefined;
        let lastResult:
          | Result<SmartFetchResponse<z.infer<S>>, Error>
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
            throw result.error;
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

        throw (
          lastError ??
          newIntegrationError({
            action: "RetryExternalApi",
            kind: "Unknown",
            reason: `Retry attempts exhausted (attempts: ${attempts}).`,
          })
        );
      })(),
      (cause) =>
        cause instanceof Error
          ? cause
          : newIntegrationError({
              action: "RetryExternalApi",
              cause,
              kind: "Unknown",
              reason: `Retry failed with a non-error value (attempts: ${attempts}).`,
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
