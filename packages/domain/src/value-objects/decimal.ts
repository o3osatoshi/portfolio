import Decimal from "decimal.js";
import { type Result, err, ok } from "neverthrow";
import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";

export type DecimalString = Brand<string, "Decimal">;

export function newDecimal(v: unknown): Result<DecimalString, Error> {
  try {
    const d = new Decimal(v as unknown as Decimal.Value);
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
    const d = new Decimal(v);
    return d.isFinite();
  } catch {
    return false;
  }
}
