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
   * Validate the inbound request, persist the transaction, and convert the
   * domain entity into a DTO-friendly response.
   *
   * @param req - Normalized request payload from the application layer.
   * @returns ResultAsync wrapping the created transaction DTO or a structured error.
   */
  execute(): ResultAsync<HeavyProcessCachedResponse, Error> {
    return kvGet<HeavyProcessResponse>(
      this.redisClient,
      HEAVY_PROCESS_CACHE_KEY,
    ).andThen((value) => {
      if (value !== null) {
        return ok({ ...value, cached: true });
      }

      return sleep(3000)
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
