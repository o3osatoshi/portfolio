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
  const prefix = config.prefix ?? "o3o:ratelimit";
  const limiterCache = new Map<string, Ratelimit>();

  return {
    consume(input) {
      const limiter = getOrCreateLimiter({
        bucket: input.bucket,
        limit: input.limit,
        limiterCache,
        prefix,
        redis,
        windowSeconds: input.windowSeconds,
      });
      const key = input.identifier;

      return ResultAsync.fromPromise(limiter.limit(key), (cause) =>
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

function getOrCreateLimiter(input: {
  bucket: string;
  limit: number;
  limiterCache: Map<string, Ratelimit>;
  prefix: string;
  redis: Redis;
  windowSeconds: number;
}): Ratelimit {
  const limiterCacheKey = `${input.bucket}:${input.limit}:${input.windowSeconds}`;
  const existing = input.limiterCache.get(limiterCacheKey);
  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    limiter: Ratelimit.fixedWindow(input.limit, `${input.windowSeconds} s`),
    prefix: `${input.prefix}:${input.bucket}`,
    redis: input.redis,
  });
  input.limiterCache.set(limiterCacheKey, limiter);
  return limiter;
}
