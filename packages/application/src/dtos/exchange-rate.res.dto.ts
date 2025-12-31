import type { ExchangeRate } from "@repo/domain";

/**
 * DTO exposed by the application layer for exchange-rate quotes.
 */
export type ExchangeRateResponse = {
  asOf: Date;
  base: string;
  quote: string;
  rate: string;
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
    quote: rate.quote,
    rate: rate.rate,
  };
}
