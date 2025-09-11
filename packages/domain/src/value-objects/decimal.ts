import { default as DecimalJs } from "decimal.js";
import { err, ok, type Result } from "neverthrow";
import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";

export type DecimalString = Brand<string, "Decimal">;

export function newDecimal(v: unknown): Result<DecimalString, Error> {
  try {
    const d = new DecimalJs(v as unknown as DecimalJs.Value);
    if (!d.isFinite()) {
      return err(
        domainValidationError({
          action: "NewDecimal",
          reason: "Decimal must be finite",
        }),
      );
    }
    return ok(d.toString() as DecimalString);
  } catch {
    return err(
      domainValidationError({
        action: "NewDecimal",
        reason: "Invalid decimal input",
      }),
    );
  }
}

export function isDecimal(v: unknown): v is DecimalString {
  if (typeof v !== "string") return false;
  try {
    const d = new DecimalJs(v);
    return d.isFinite();
  } catch {
    return false;
  }
}
