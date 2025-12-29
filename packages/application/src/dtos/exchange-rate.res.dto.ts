import type { ExchangeRate } from "@repo/domain";

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
 * Successful payload returned when fetching a currency exchange rate.
 */
export type GetExchangeRateResponse = ExchangeRateResponse;

/**
 * Map a domain {@link ExchangeRate} into an externally visible DTO.
 */
export function toExchangeRateResponse(
  rate: ExchangeRate,
): ExchangeRateResponse {
  return {
    asOf: rate.asOf,
    base: rate.base,
    rate: rate.rate,
    target: rate.target,
  };
}
