import type { CacheSetOptions, CacheStore } from "@repo/domain";
import type { Redis as UpstashRedis } from "@upstash/redis";
import { ResultAsync } from "neverthrow";

import { newError } from "@o3osatoshi/toolkit";

export type UpstashRedisClient = Pick<UpstashRedis, "get" | "set">;
/**
 * Connection options for Upstash Redis.
 */
export type UpstashRedisOptions = {
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
        newError({
          action: "ReadCacheStore",
          cause,
          hint: "Verify cache store connectivity or credentials.",
          impact: "response served without cache",
          kind: "Unavailable",
          layer: "Infra",
          reason: "Cache store read failed",
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
        newError({
          action: "WriteCacheStore",
          cause,
          hint: "Verify cache store connectivity or credentials.",
          impact: "response served without cache",
          kind: "Unavailable",
          layer: "Infra",
          reason: "Cache store write failed",
        }),
      );
    },
  };
}
