import type { ResultAsync } from "neverthrow";

import type { CurrencyCode, ExchangeRate } from "../value-objects";

/**
 * Port describing exchange-rate providers (external APIs, caches, etc.).
 */
export interface ExchangeRateProvider {
  /** Fetch the latest exchange rate for a currency pair. */
  getRate(query: ExchangeRateQuery): ResultAsync<ExchangeRate, Error>;
}

/**
 * Query payload for loading a currency exchange rate.
 */
export type ExchangeRateQuery = {
  base: CurrencyCode;
  target: CurrencyCode;
};
