import type { CacheSetOptions, CacheStore } from "@repo/domain";
import type { Redis as UpstashRedis } from "@upstash/redis";
import { ResultAsync } from "neverthrow";

import { newIntegrationError } from "../integration-error";
import { integrationErrorCodes } from "../integration-error-catalog";

export type UpstashRedisClient = Pick<UpstashRedis, "get" | "set">;
/**
 * Connection configuration for Upstash Redis.
 */
export type UpstashRedisConfig = {
  token?: string;
  url?: string;
};

/**
 * Wrap a preconfigured Upstash client with the {@link CacheStore} interface.
 */
export function wrapUpstashRedis(client: UpstashRedisClient): CacheStore {
  return {
    get: (key) =>
      ResultAsync.fromPromise(client.get(key), (cause) =>
        newIntegrationError({
          cause,
          code: integrationErrorCodes.CACHE_READ_FAILED,
          details: {
            action: "ReadCacheStore",
            hint: "Verify cache store connectivity or credentials.",
            impact: "response served without cache",
            reason: "Cache store read failed",
          },
          isOperational: true,
          kind: "Unavailable",
        }),
      ),
    set: (key, value, options: CacheSetOptions = {}) => {
      const px = options.ttlMs;
      const nx = options.onlyIfAbsent;
      const xx = options.onlyIfPresent;
      const opts: Record<string, unknown> = {
        ...(px !== undefined ? { px } : {}),
        ...(nx !== undefined ? { nx } : {}),
        ...(xx !== undefined ? { xx } : {}),
      };
      return ResultAsync.fromPromise(client.set(key, value, opts), (cause) =>
        newIntegrationError({
          cause,
          code: integrationErrorCodes.CACHE_WRITE_FAILED,
          details: {
            action: "WriteCacheStore",
            hint: "Verify cache store connectivity or credentials.",
            impact: "response served without cache",
            reason: "Cache store write failed",
          },
          isOperational: true,
          kind: "Unavailable",
        }),
      );
    },
  };
}
