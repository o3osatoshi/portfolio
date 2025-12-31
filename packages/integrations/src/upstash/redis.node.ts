import type { CacheStore } from "@repo/domain";
import { Redis } from "@upstash/redis";

import { type UpstashRedisOptions, wrapUpstashRedis } from "./redis";

/**
 * Create a cache store backed by an Upstash Redis client (Node runtime).
 */
export function createUpstashRedis(options?: UpstashRedisOptions): CacheStore {
  return wrapUpstashRedis(
    new Redis({ token: options?.token, url: options?.url }),
  );
}
