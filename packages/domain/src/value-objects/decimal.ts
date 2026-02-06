import { default as DecimalJs } from "decimal.js";
import { err, ok, type Result } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";

/**
 * Canonical decimal representation (string) produced by Decimal.js.
 */
export type DecimalString = Brand<string, "Decimal">;

/** Type guard ensuring the value can be handled as a {@link DecimalString}. */
export function isDecimal(v: unknown): v is DecimalString {
  if (typeof v !== "string") return false;
  try {
    const d = new DecimalJs(v);
    return d.isFinite();
  } catch {
    return false;
  }
}

export function isNonNegativeDecimal(value: DecimalString): boolean {
  try {
    return new DecimalJs(value).gte(0);
  } catch {
    return false;
  }
}

/**
 * Check whether a decimal string represents a value strictly greater than zero.
 */
export function isPositiveDecimal(value: DecimalString): boolean {
  try {
    return new DecimalJs(value).gt(0);
  } catch {
    return false;
  }
}

/**
 * Normalize arbitrary numeric input into a {@link DecimalString}.
 */
export function newDecimal(v: unknown): Result<DecimalString, RichError> {
  try {
    const d = new DecimalJs(v as unknown as DecimalJs.Value);
    if (!d.isFinite()) {
      return err(
        domainValidationError({
          details: {
            action: "NewDecimal",
            reason: "Decimal must be finite",
          },
        }),
      );
    }
    return ok(d.toString() as DecimalString);
  } catch {
    return err(
      domainValidationError({
        details: {
          action: "NewDecimal",
          reason: "Invalid decimal input",
        },
      }),
    );
  }
}
