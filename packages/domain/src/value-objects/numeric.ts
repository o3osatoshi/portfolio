import { err, ok, type Result } from "neverthrow";

import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";
import {
  type DecimalString,
  isNonNegativeDecimal,
  isPositiveDecimal,
  newDecimal,
} from "./decimal";

/** Monetary quantity (strictly greater than zero). */
export type Amount = Brand<DecimalString, "Amount">;
/** Transaction fee (greater than or equal to zero). */
export type Fee = Brand<DecimalString, "Fee">;
/** Unit price (strictly greater than zero). */
export type Price = Brand<DecimalString, "Price">;
/** Profit/loss that may be positive, negative, or zero. */
export type ProfitLoss = Brand<DecimalString, "ProfitLoss">;

/** Type guard verifying the value is an {@link Amount}. */
export function isAmount(v: unknown): v is Amount {
  return typeof v === "string";
}
/** Type guard verifying the value is a {@link Fee}. */
export function isFee(v: unknown): v is Fee {
  return typeof v === "string";
}

/** Type guard verifying the value is a {@link Price}. */
export function isPrice(v: unknown): v is Price {
  return typeof v === "string";
}

/** Type guard verifying the value is a {@link ProfitLoss}. */
export function isProfitLoss(v: unknown): v is ProfitLoss {
  return typeof v === "string";
}

/**
 * Normalize an unknown value into an {@link Amount}, ensuring it is > 0.
 */
export function newAmount(v: unknown): Result<Amount, Error> {
  const r = newDecimal(v);
  if (r.isErr()) return err(r.error);
  if (!isPositiveDecimal(r.value))
    return err(
      domainValidationError({
        details: {
          action: "NewAmount",
          reason: "Amount must be > 0",
        },
      }),
    );
  return ok(r.value as Amount);
}

/**
 * Normalize an unknown value into a {@link Fee}, ensuring it is >= 0.
 */
export function newFee(v: unknown): Result<Fee, Error> {
  const r = newDecimal(v);
  if (r.isErr()) return err(r.error);
  if (!isNonNegativeDecimal(r.value))
    return err(
      domainValidationError({
        details: {
          action: "NewFee",
          reason: "Fee must be >= 0",
        },
      }),
    );
  return ok(r.value as Fee);
}

/**
 * Normalize an unknown value into a {@link Price}, ensuring it is > 0.
 */
export function newPrice(v: unknown): Result<Price, Error> {
  const r = newDecimal(v);
  if (r.isErr()) return err(r.error);
  if (!isPositiveDecimal(r.value))
    return err(
      domainValidationError({
        details: {
          action: "NewPrice",
          reason: "Price must be > 0",
        },
      }),
    );
  return ok(r.value as Price);
}
/**
 * Normalize an unknown value into a {@link ProfitLoss} (any decimal string).
 */
export function newProfitLoss(v: unknown): Result<ProfitLoss, Error> {
  const r = newDecimal(v);
  if (r.isErr()) return err(r.error);
  return ok(r.value as ProfitLoss);
}
