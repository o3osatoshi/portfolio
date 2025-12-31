import type { CacheSetOptions, CacheStore } from "@repo/domain";
import { ResultAsync } from "neverthrow";

import { newError } from "@o3osatoshi/toolkit";

export type UpstashRedisClient = {
  get<T>(key: string): Promise<null | T>;
  set<T>(
    key: string,
    value: T,
    options?: Record<string, unknown>,
  ): Promise<"OK" | null | T>;
};

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
          action: "CacheGet",
          cause,
          hint: "Verify Redis connectivity or cache configuration.",
          impact: "Cache read failed; callers should fall back to source data.",
          kind: "Unavailable",
          layer: "Infra",
          reason: "Failed to read value from Redis cache store",
        }),
      ),
    set: (key, value, options: CacheSetOptions = {}) => {
      const px = options.ttlMs;
      const nx = options.onlyIfAbsent;
      const xx = options.onlyIfPresent;
      const opts: Record<string, unknown> = {
        ...(px ? { px } : {}),
        ...(nx ? { nx } : {}),
        ...(xx ? { xx } : {}),
      };
      return ResultAsync.fromPromise(client.set(key, value, opts), (cause) =>
        newError({
          action: "CacheSet",
          cause,
          hint: "Verify Redis connectivity or cache configuration.",
          impact: "Cache write failed; response will be served without cache.",
          kind: "Unavailable",
          layer: "Infra",
          reason: "Failed to write value to Redis cache store",
        }),
      );
    },
  };
}
