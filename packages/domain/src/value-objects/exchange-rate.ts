import { default as DecimalJs } from "decimal.js";
import { err, ok, Result } from "neverthrow";

import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";
import { type CurrencyCode, newCurrencyCode } from "./currency";
import { type DateTime, newDateTime } from "./datetime";
import { type DecimalString, newDecimal } from "./decimal";

/**
 * Validated exchange rate quote between two currencies.
 */
export type ExchangeRate = {
  asOf: DateTime;
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: ExchangeRateValue;
};

/**
 * Normalized exchange rate (strictly greater than zero).
 */
export type ExchangeRateValue = Brand<DecimalString, "ExchangeRateValue">;

/**
 * Untyped payload accepted by {@link newExchangeRate} before validation.
 */
export type NewExchangeRateInput = {
  asOf: unknown;
  base: unknown;
  quote: unknown;
  rate: unknown;
};

/**
 * Validate raw input into a domain {@link ExchangeRate} quote.
 */
export function newExchangeRate(
  input: NewExchangeRateInput,
): Result<ExchangeRate, Error> {
  return Result.combine([
    newCurrencyCode(input.base),
    newCurrencyCode(input.quote),
    newExchangeRateValue(input.rate),
    newDateTime(input.asOf),
  ]).map(([base, quote, rate, asOf]) => ({
    asOf,
    base,
    quote,
    rate,
  }));
}

/**
 * Normalize an unknown value into an {@link ExchangeRateValue}, ensuring it is > 0.
 */
export function newExchangeRateValue(
  v: unknown,
): Result<ExchangeRateValue, Error> {
  const res = newDecimal(v);
  if (res.isErr()) return err(res.error);
  if (!isPositiveDecimal(res.value)) {
    return err(
      domainValidationError({
        action: "NewExchangeRateValue",
        reason: "Exchange rate must be > 0",
      }),
    );
  }
  return ok(res.value as ExchangeRateValue);
}

function isPositiveDecimal(value: DecimalString): boolean {
  try {
    return new DecimalJs(value).gt(0);
  } catch {
    return false;
  }
}
