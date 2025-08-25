import { type Result, err, ok } from "neverthrow";
import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";

export type TransactionType = Brand<"BUY" | "SELL", "TransactionType">;

export function newTransactionType(v: unknown): Result<TransactionType, Error> {
  if (v === "BUY" || v === "SELL") return ok(v as TransactionType);
  return err(
    domainValidationError({
      action: "NewTransactionType",
      reason: "TransactionType must be BUY or SELL",
    }),
  );
}

export function isTransactionType(v: unknown): v is TransactionType {
  return v === "BUY" || v === "SELL";
}
