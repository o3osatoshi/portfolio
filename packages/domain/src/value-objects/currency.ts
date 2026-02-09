import { err, ok, type Result } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { newDomainError } from "../domain-error";
import { domainErrorCodes } from "../domain-error-catalog";
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
export function newCurrencyCode(v: unknown): Result<CurrencyCode, RichError> {
  if (typeof v !== "string")
    return err(
      newDomainError({
        code: domainErrorCodes.CURRENCY_CODE_NOT_STRING,
        details: {
          action: "NewCurrencyCode",
          reason: "CurrencyCode must be string",
        },
        isOperational: true,
        kind: "Validation",
      }),
    );
  const code = v.toUpperCase();
  if (!CURRENCY_RE.test(code))
    return err(
      newDomainError({
        code: domainErrorCodes.CURRENCY_CODE_FORMAT_INVALID,
        details: {
          action: "NewCurrencyCode",
          reason: "CurrencyCode must be A-Z 3 letters",
        },
        isOperational: true,
        kind: "Validation",
      }),
    );
  return ok(code as CurrencyCode);
}
