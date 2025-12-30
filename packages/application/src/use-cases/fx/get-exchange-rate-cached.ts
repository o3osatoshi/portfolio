import type { CacheStore, ExchangeRateProvider } from "@repo/domain";
import { newCurrencyCode } from "@repo/domain";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import type {
  GetExchangeRateRequest,
  GetExchangeRateResponse,
} from "../../dtos";
import { GetExchangeRateUseCase } from "./get-exchange-rate";

const EXCHANGE_RATE_CACHE_KEY_PREFIX = "fx:rate";
const EXCHANGE_RATE_CACHE_TTL_MS = 3_600_000;

/**
 * Use case that fetches the latest exchange rate with cache support.
 */
export class GetExchangeRateCachedUseCase {
  private readonly fallback: GetExchangeRateUseCase;

  constructor(
    provider: ExchangeRateProvider,
    private readonly cacheStore: CacheStore,
  ) {
    this.fallback = new GetExchangeRateUseCase(provider);
  }

  /**
   * Validate currency codes, attempt to read cached response, and refresh as needed.
   *
   * @param req - Normalized request payload.
   * @returns ResultAsync with a typed response or a structured error.
   */
  execute(
    req: GetExchangeRateRequest,
  ): ResultAsync<GetExchangeRateResponse, Error> {
    const base = newCurrencyCode(req.base);
    if (base.isErr()) return errAsync(base.error);
    const target = newCurrencyCode(req.target);
    if (target.isErr()) return errAsync(target.error);

    const cacheKey = `${EXCHANGE_RATE_CACHE_KEY_PREFIX}:${base.value}:${target.value}`;

    return this.cacheStore
      .get<GetExchangeRateResponse>(cacheKey)
      .orElse(() => okAsync(null))
      .andThen((cached) => {
        if (cached !== null) {
          return okAsync(cached);
        }

        return this.fallback
          .execute({ base: base.value, target: target.value })
          .andThen((response) =>
            this.cacheStore
              .set(cacheKey, response, { ttlMs: EXCHANGE_RATE_CACHE_TTL_MS })
              .orElse(() => okAsync(null))
              .map(() => response),
          );
      });
  }
}
