import { err, ok, type Result } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { newDomainError } from "../domain-error";
import { domainErrorCodes } from "../domain-error-catalog";
import type { Brand } from "./brand";

/**
 * Nominal identifier for transactions.
 */
export type TransactionId = Brand<string, "TransactionId">;
/**
 * Nominal identifier for users.
 */
export type UserId = Brand<string, "UserId">;

/** Type guard ensuring the value is a {@link TransactionId}. */
export function isTransactionId(v: unknown): v is TransactionId {
  return typeof v === "string" && v.length > 0;
}

/** Type guard ensuring the value is a {@link UserId}. */
export function isUserId(v: unknown): v is UserId {
  return typeof v === "string" && v.length > 0;
}

/**
 * Validate unknown input and return a sanitized {@link TransactionId}.
 */
export function newTransactionId(v: unknown): Result<TransactionId, RichError> {
  if (!nonEmptyString(v))
    return err(
      newDomainError({
        code: domainErrorCodes.TRANSACTION_ID_NOT_EMPTY,
        details: {
          action: "NewTransactionId",
          reason: "TransactionId must be non-empty",
        },
        isOperational: true,
        kind: "Validation",
      }),
    );
  return ok(v as TransactionId);
}

/**
 * Validate unknown input and return a sanitized {@link UserId}.
 */
export function newUserId(v: unknown): Result<UserId, RichError> {
  if (!nonEmptyString(v))
    return err(
      newDomainError({
        code: domainErrorCodes.USER_ID_NOT_EMPTY,
        details: {
          action: "NewUserId",
          reason: "UserId must be non-empty",
        },
        isOperational: true,
        kind: "Validation",
      }),
    );
  return ok(v as UserId);
}

/** Internal helper ensuring a string is present after trimming whitespace. */
function nonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}
