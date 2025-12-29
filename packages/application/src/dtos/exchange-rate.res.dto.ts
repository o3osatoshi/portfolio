import type { ExchangeRate } from "@repo/domain";

/**
 * Successful payload returned when fetching a currency exchange rate.
 */
export type GetExchangeRateResponse = ExchangeRateResponse;

/**
 * DTO exposed by the application layer for exchange-rate quotes.
 */
export type ExchangeRateResponse = {
  asOf: Date;
  base: string;
  rate: string;
  target: string;
};

/**
 * Map a domain {@link ExchangeRate} into an externally visible DTO.
 */
export function toExchangeRateResponse(rate: ExchangeRate): ExchangeRateResponse {
  return {
    asOf: rate.asOf,
    base: rate.base,
    rate: rate.rate,
    target: rate.target,
  };
}
