import type { Redis } from "@upstash/redis";
import type { Redis as EdgeRedis } from "@upstash/redis/cloudflare";
import { ok, type ResultAsync } from "neverthrow";

import { kvGet, kvSet, sleep } from "@o3osatoshi/toolkit";

import type {
  HeavyProcessCachedResponse,
  HeavyProcessResponse,
} from "../../dtos/heavy-process.res.dto";

const HEAVY_PROCESS_CACHE_KEY = "edge:public:heavy";
const HEAVY_PROCESS_CACHE_TTL_MS = 200_000;

export class HeavyProcessCachedUseCase {
  constructor(private readonly redisClient: EdgeRedis | Redis) {}

  /**
   * Execute a heavy process with Redis-backed caching.
   *
   * - Attempts to read a {@link HeavyProcessResponse} from Redis using
   *   {@link HEAVY_PROCESS_CACHE_KEY}.
   * - When a cached value exists, it returns the cached payload with
   *   `cached: true`.
   * - When no cached value exists, it simulates a heavy computation by
   *   sleeping for 3 seconds, writes the result to Redis with
   *   {@link HEAVY_PROCESS_CACHE_TTL_MS}, and returns the payload with
   *   `cached: false`.
   *
   * @returns ResultAsync wrapping a {@link HeavyProcessCachedResponse} or an
   * {@link Error} if the underlying Redis or sleep operations fail.
   */
  execute(): ResultAsync<HeavyProcessCachedResponse, Error> {
    return kvGet<HeavyProcessResponse>(
      this.redisClient,
      HEAVY_PROCESS_CACHE_KEY,
    ).andThen((value) => {
      if (value !== null) {
        return ok({ ...value, cached: true });
      }

      return sleep(3_000)
        .map(() => ({ timestamp: new Date() }))
        .andThen((heavyProcess) => {
          return kvSet(
            this.redisClient,
            HEAVY_PROCESS_CACHE_KEY,
            heavyProcess,
            {
              ttlMs: HEAVY_PROCESS_CACHE_TTL_MS,
            },
          ).map(() => heavyProcess);
        })
        .andThen((heavyProcess) => ok({ ...heavyProcess, cached: false }));
    });
  }
}
