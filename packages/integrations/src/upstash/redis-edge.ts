import type { CacheStore } from "@repo/domain";
import { Redis } from "@upstash/redis/cloudflare";

import { type UpstashRedisConfig, wrapUpstashRedis } from "./redis";

/**
 * Create a cache store backed by an Upstash Redis client (Edge runtime).
 */
export function createEdgeUpstashRedis(
  config?: UpstashRedisConfig,
): CacheStore {
  return wrapUpstashRedis(
    new Redis({ token: config?.token, url: config?.url }),
  );
}
