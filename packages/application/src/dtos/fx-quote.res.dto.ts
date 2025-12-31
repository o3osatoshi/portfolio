import type { FxQuote } from "@repo/domain";

/**
 * DTO exposed by the application layer for FX quotes.
 */
export type FxQuoteResponse = {
  asOf: Date;
  base: string;
  quote: string;
  rate: string;
};

/**
 * Successful payload returned when fetching an FX quote.
 */
export type GetFxQuoteResponse = FxQuoteResponse;

/**
 * Map a domain {@link FxQuote} into an externally visible DTO.
 */
export function toFxQuoteResponse(quote: FxQuote): FxQuoteResponse {
  return {
    asOf: quote.asOf,
    base: quote.base,
    quote: quote.quote,
    rate: quote.rate,
  };
}
