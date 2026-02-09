import type { CacheStore } from "@repo/domain";
import { okAsync, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import type {
  HeavyProcessCachedResponse,
  HeavyProcessResponse,
} from "../../dtos";
import { ensureApplicationErrorI18n } from "../../error-i18n";
import { HeavyProcessUseCase } from "./heavy-process";

const CACHE_KEY_PREFIX = "edge:public:heavy";
const CACHE_TTL_MS = 200_000;

export class HeavyProcessCachedUseCase {
  constructor(
    private readonly cacheStore: CacheStore,
    private readonly heavyProcess: HeavyProcessUseCase = new HeavyProcessUseCase(),
  ) {}

  /**
   * Execute a cached heavy process.
   *
   * - Attempts to read a {@link HeavyProcessResponse} from the cache store
   *   using {@link CACHE_KEY_PREFIX}.
   * - When a cached value exists, it returns the cached payload with
   *   `cached: true`.
   * - When no cached value exists, it runs the heavy process, writes the
   *   result to the cache store with {@link CACHE_TTL_MS}, and
   *   returns the payload with `cached: false`.
   *
   * @returns ResultAsync wrapping a {@link HeavyProcessCachedResponse} or an
   * {@link Error} if the underlying heavy process fails.
   */
  execute(): ResultAsync<HeavyProcessCachedResponse, RichError> {
    return this.cacheStore
      .get<HeavyProcessResponse>(CACHE_KEY_PREFIX)
      .orElse(() => okAsync(null))
      .andThen((value) => {
        if (value !== null) {
          return okAsync({ ...value, cached: true });
        }

        return this.heavyProcess.execute().andThen((heavyProcess) =>
          this.cacheStore
            .set(CACHE_KEY_PREFIX, heavyProcess, {
              ttlMs: CACHE_TTL_MS,
            })
            .orElse(() => okAsync(null))
            .map(() => ({ ...heavyProcess, cached: false })),
        );
      })
      .mapErr((error) => ensureApplicationErrorI18n(error));
  }
}
