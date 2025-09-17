import { err, ok, type Result } from "neverthrow";

import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";

export type CurrencyCode = Brand<string, "CurrencyCode">;

const CURRENCY_RE = /^[A-Z]{3}$/;

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && CURRENCY_RE.test(v);
}

export function newCurrencyCode(v: unknown): Result<CurrencyCode, Error> {
  if (typeof v !== "string")
    return err(
      domainValidationError({
        action: "NewCurrencyCode",
        reason: "CurrencyCode must be string",
      }),
    );
  const code = v.toUpperCase();
  if (!CURRENCY_RE.test(code))
    return err(
      domainValidationError({
        action: "NewCurrencyCode",
        reason: "CurrencyCode must be A-Z 3 letters",
      }),
    );
  return ok(code as CurrencyCode);
}
