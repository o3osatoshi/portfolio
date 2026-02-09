import { err, ok, type Result } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { newDomainError } from "../domain-error";
import { domainErrorCodes } from "../domain-error-catalog";
import type { Brand } from "./brand";

/**
 * Nominal wrapper around `Date` ensuring the instance is valid.
 */
export type DateTime = Brand<Date, "DateTime">;

/** Type guard ensuring the value is a {@link DateTime}. */
export function isDateTime(v: unknown): v is DateTime {
  return v instanceof Date && !Number.isNaN(v.getTime());
}
/**
 * Validate unknown input and ensure it is a finite `Date` instance.
 */
export function newDateTime(v: unknown): Result<DateTime, RichError> {
  if (!(v instanceof Date))
    return err(
      newDomainError({
        code: domainErrorCodes.DATETIME_NOT_DATE,
        details: {
          action: "NewDateTime",
          reason: "DateTime must be a Date",
        },
        kind: "Validation",
      }),
    );
  if (Number.isNaN(v.getTime()))
    return err(
      newDomainError({
        code: domainErrorCodes.DATETIME_INVALID,
        details: {
          action: "NewDateTime",
          reason: "DateTime is invalid",
        },
        kind: "Validation",
      }),
    );
  return ok(v as DateTime);
}
