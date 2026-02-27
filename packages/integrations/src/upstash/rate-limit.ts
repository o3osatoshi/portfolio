import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ResultAsync } from "neverthrow";

import type { RateLimitStore } from "@o3osatoshi/toolkit";

import { newIntegrationError } from "../integration-error";
import { integrationErrorCodes } from "../integration-error-catalog";

export type UpstashRateLimitStoreConfig = {
  prefix?: string | undefined;
  token: string;
  url: string;
};

/**
 * Create a generic RateLimitStore backed by Upstash fixed-window limiters.
 */
export function createUpstashRateLimitStore(
  config: UpstashRateLimitStoreConfig,
): RateLimitStore {
  const redis = new Redis({
    token: config.token,
    url: config.url,
  });
  const limiterMap = new Map<string, Ratelimit>();

  return {
    consume(input) {
      const limiter = getsertLimiter({
        bucket: input.bucket,
        limit: input.limit,
        limiterMap,
        prefix: config.prefix ?? "o3o:ratelimit",
        redis,
        windowSeconds: input.windowSeconds,
      });

      return ResultAsync.fromPromise(limiter.limit(input.identifier), (cause) =>
        newIntegrationError({
          cause,
          code: integrationErrorCodes.RATE_LIMIT_CHECK_FAILED,
          details: {
            action: "ConsumeRateLimit",
            reason: "Failed to evaluate rate limit via Upstash.",
          },
          i18n: { key: "errors.application.unavailable" },
          isOperational: true,
          kind: "Unavailable",
        }),
      ).map((result) => ({
        allowed: result.success,
        limit: result.limit,
        remaining: result.remaining,
        resetEpochSeconds: Math.ceil(result.reset / 1000),
      }));
    },
  };
}

function getsertLimiter(input: {
  bucket: string;
  limit: number;
  limiterMap: Map<string, Ratelimit>;
  prefix: string;
  redis: Redis;
  windowSeconds: number;
}): Ratelimit {
  const key = `${input.bucket}:${input.limit}:${input.windowSeconds}`;

  const cachedLimiter = input.limiterMap.get(key);
  if (cachedLimiter) {
    return cachedLimiter;
  }

  const limiter = new Ratelimit({
    limiter: Ratelimit.fixedWindow(input.limit, `${input.windowSeconds} s`),
    prefix: `${input.prefix}:${input.bucket}`,
    redis: input.redis,
  });
  input.limiterMap.set(key, limiter);
  return limiter;
}
