import { err, ok, type Result } from "neverthrow";

import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";

/**
 * Enumeration of trade directions represented as a branded string.
 */
export type TransactionType = Brand<"BUY" | "SELL", "TransactionType">;

/** Type guard ensuring the value is a {@link TransactionType}. */
export function isTransactionType(v: unknown): v is TransactionType {
  return v === "BUY" || v === "SELL";
}
/**
 * Validate unknown input and coerce it into a {@link TransactionType}.
 */
export function newTransactionType(v: unknown): Result<TransactionType, Error> {
  if (v === "BUY" || v === "SELL") return ok(v as TransactionType);
  return err(
    domainValidationError({
      action: "NewTransactionType",
      reason: "TransactionType must be BUY or SELL",
    }),
  );
}
