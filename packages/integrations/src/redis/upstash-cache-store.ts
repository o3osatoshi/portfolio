import type { CacheSetOptions, CacheStore } from "@repo/domain";
import { Redis } from "@upstash/redis";
import { Redis as EdgeRedis } from "@upstash/redis/cloudflare";
import { ResultAsync } from "neverthrow";

import { newError } from "@o3osatoshi/toolkit";

/**
 * Connection options for Upstash Redis.
 */
export type UpstashRedisOptions = {
  token?: string;
  url?: string;
};

type UpstashRedisClient = {
  get<T>(key: string): Promise<null | T>;
  set<T>(
    key: string,
    value: T,
    options?: Record<string, unknown>,
  ): Promise<"OK" | null | T>;
};

/**
 * Create a cache store backed by an Upstash Redis client (Edge runtime).
 */
export function createEdgeUpstashCacheStore(
  options?: UpstashRedisOptions,
): CacheStore {
  return wrapUpstashClient(
    new EdgeRedis({ token: options?.token, url: options?.url }),
  );
}

/**
 * Create a cache store backed by an Upstash Redis client (Node runtime).
 */
export function createUpstashCacheStore(
  options?: UpstashRedisOptions,
): CacheStore {
  return wrapUpstashClient(
    new Redis({ token: options?.token, url: options?.url }),
  );
}

/**
 * Wrap a preconfigured Upstash client with the {@link CacheStore} interface.
 */
export function wrapUpstashClient(client: UpstashRedisClient): CacheStore {
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
      const opts: Record<string, unknown> = {
        ...(options.ttlMs !== undefined ? { px: options.ttlMs } : {}),
        ...(options.onlyIfAbsent !== undefined
          ? { nx: options.onlyIfAbsent }
          : {}),
        ...(options.onlyIfPresent !== undefined
          ? { xx: options.onlyIfPresent }
          : {}),
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
