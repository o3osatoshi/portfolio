import { err, ok, Result } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";
import { type CurrencyCode, newCurrencyCode } from "./currency";
import { type DateTime, newDateTime } from "./datetime";
import { type DecimalString, isPositiveDecimal, newDecimal } from "./decimal";

/**
 * Validated FX quote between two currencies.
 */
export type FxQuote = {
  asOf: DateTime;
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: FxRate;
};

/**
 * Normalized FX rate (strictly greater than zero).
 */
export type FxRate = Brand<DecimalString, "FxRate">;

/**
 * Untyped payload accepted by {@link newFxQuote} before validation.
 */
export type NewFxQuoteInput = {
  asOf: unknown;
  base: unknown;
  quote: unknown;
  rate: unknown;
};

/**
 * Validate raw input into a domain {@link FxQuote}.
 */
export function newFxQuote(input: NewFxQuoteInput): Result<FxQuote, RichError> {
  return Result.combine([
    newCurrencyCode(input.base),
    newCurrencyCode(input.quote),
    newFxRate(input.rate),
    newDateTime(input.asOf),
  ]).map(([base, quote, rate, asOf]) => ({
    asOf,
    base,
    quote,
    rate,
  }));
}

/**
 * Normalize an unknown value into an {@link FxRate}, ensuring it is > 0.
 */
export function newFxRate(v: unknown): Result<FxRate, RichError> {
  const res = newDecimal(v);
  if (res.isErr()) return err(res.error);
  if (!isPositiveDecimal(res.value)) {
    return err(
      domainValidationError({
        details: {
          action: "NewFxRate",
          reason: "FX rate must be > 0",
        },
      }),
    );
  }
  return ok(res.value as FxRate);
}
