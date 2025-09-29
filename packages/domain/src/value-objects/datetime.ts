import { err, ok, type Result } from "neverthrow";

import { domainValidationError } from "../domain-error";
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
export function newDateTime(v: unknown): Result<DateTime, Error> {
  if (!(v instanceof Date))
    return err(
      domainValidationError({
        action: "NewDateTime",
        reason: "DateTime must be a Date",
      }),
    );
  if (Number.isNaN(v.getTime()))
    return err(
      domainValidationError({
        action: "NewDateTime",
        reason: "DateTime is invalid",
      }),
    );
  return ok(v as DateTime);
}
