import type { CacheStore } from "@repo/domain";
import { Redis } from "@upstash/redis/cloudflare";

import { type UpstashRedisOptions, wrapUpstashRedis } from "./redis";

/**
 * Create a cache store backed by an Upstash Redis client (Edge runtime).
 */
export function createEdgeUpstashRedis(
  options?: UpstashRedisOptions,
): CacheStore {
  return wrapUpstashRedis(
    new Redis({ token: options?.token, url: options?.url }),
  );
}
