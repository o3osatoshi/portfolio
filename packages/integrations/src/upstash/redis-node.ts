import type { CacheStore } from "@repo/domain";
import { Redis } from "@upstash/redis";

import { type UpstashRedisConfig, wrapUpstashRedis } from "./redis";

/**
 * Create a cache store backed by an Upstash Redis client (Node runtime).
 *
 * @public
 */
export function createUpstashRedis(config?: UpstashRedisConfig): CacheStore {
  return wrapUpstashRedis(
    new Redis({ token: config?.token, url: config?.url }),
  );
}
