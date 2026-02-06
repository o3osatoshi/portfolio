import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import type { CurrencyCode, FxQuote } from "../value-objects";

/**
 * Port describing FX quote providers (external APIs, caches, etc.).
 */
export interface FxQuoteProvider {
  /** Fetch the latest FX quote for a currency pair. */
  getRate(query: FxQuoteQuery): ResultAsync<FxQuote, RichError>;
}

/**
 * Query payload for loading a currency FX quote.
 */
export type FxQuoteQuery = {
  base: CurrencyCode;
  quote: CurrencyCode;
};
