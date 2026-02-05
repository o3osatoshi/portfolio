import { err, ok, type Result } from "neverthrow";

import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";

/**
 * ISO-4217 compliant three-letter uppercase currency code.
 */
export type CurrencyCode = Brand<string, "CurrencyCode">;

const CURRENCY_RE = /^[A-Z]{3}$/;

/** Type guard ensuring the value is a {@link CurrencyCode}. */
export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && CURRENCY_RE.test(v);
}
/**
 * Validate unknown input and return a normalized uppercase currency code.
 */
export function newCurrencyCode(v: unknown): Result<CurrencyCode, Error> {
  if (typeof v !== "string")
    return err(
      domainValidationError({
        details: {
          action: "NewCurrencyCode",
          reason: "CurrencyCode must be string",
        },
      }),
    );
  const code = v.toUpperCase();
  if (!CURRENCY_RE.test(code))
    return err(
      domainValidationError({
        details: {
          action: "NewCurrencyCode",
          reason: "CurrencyCode must be A-Z 3 letters",
        },
      }),
    );
  return ok(code as CurrencyCode);
}
