import type { CacheStore } from "@repo/domain";
import { okAsync, type ResultAsync } from "neverthrow";

import type {
  HeavyProcessCachedResponse,
  HeavyProcessResponse,
} from "../../dtos/heavy-process.res.dto";
import { HeavyProcessUseCase } from "./heavy-process";

const HEAVY_PROCESS_CACHE_KEY = "edge:public:heavy";
const HEAVY_PROCESS_CACHE_TTL_MS = 200_000;

export class HeavyProcessCachedUseCase {
  constructor(
    private readonly cacheStore: CacheStore,
    private readonly heavyProcess: HeavyProcessUseCase = new HeavyProcessUseCase(),
  ) {}

  /**
   * Execute a heavy process with cache-backed caching.
   *
   * - Attempts to read a {@link HeavyProcessResponse} from the cache store
   *   using {@link HEAVY_PROCESS_CACHE_KEY}.
   * - When a cached value exists, it returns the cached payload with
   *   `cached: true`.
   * - When no cached value exists, it runs the heavy process, writes the
   *   result to the cache store with {@link HEAVY_PROCESS_CACHE_TTL_MS}, and
   *   returns the payload with `cached: false`.
   *
   * @returns ResultAsync wrapping a {@link HeavyProcessCachedResponse} or an
   * {@link Error} if the underlying heavy process fails.
   */
  execute(): ResultAsync<HeavyProcessCachedResponse, Error> {
    return this.cacheStore
      .get<HeavyProcessResponse>(HEAVY_PROCESS_CACHE_KEY)
      .orElse(() => okAsync(null))
      .andThen((value) => {
        if (value !== null) {
          return okAsync({ ...value, cached: true });
        }

        return this.heavyProcess.execute().andThen((heavyProcess) =>
          this.cacheStore
            .set(
              HEAVY_PROCESS_CACHE_KEY,
              heavyProcess,
              {
                ttlMs: HEAVY_PROCESS_CACHE_TTL_MS,
              },
            )
            .orElse(() => okAsync(null))
            .map(() => ({ ...heavyProcess, cached: false })),
        );
      });
  }
}
