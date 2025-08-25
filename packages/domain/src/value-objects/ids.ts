import { err, ok, type Result } from "neverthrow";
import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";

export type TransactionId = Brand<string, "TransactionId">;
export type UserId = Brand<string, "UserId">;

function nonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function makeTransactionId(v: unknown): Result<TransactionId, Error> {
  if (!nonEmptyString(v))
    return err(
      domainValidationError({
        action: "MakeTransactionId",
        reason: "TransactionId must be non-empty",
      }),
    );
  return ok(v as TransactionId);
}

export function makeUserId(v: unknown): Result<UserId, Error> {
  if (!nonEmptyString(v))
    return err(
      domainValidationError({
        action: "MakeUserId",
        reason: "UserId must be non-empty",
      }),
    );
  return ok(v as UserId);
}

export function isTransactionId(v: unknown): v is TransactionId {
  return typeof v === "string" && v.length > 0;
}

export function isUserId(v: unknown): v is UserId {
  return typeof v === "string" && v.length > 0;
}
