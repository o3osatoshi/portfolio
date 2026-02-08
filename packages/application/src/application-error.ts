import {
  type Kind,
  type NewRichError,
  newRichError,
  type RichError,
} from "@o3osatoshi/toolkit";

import type {
  ApplicationErrorCode,
  ApplicationErrorI18n,
} from "./application-error-catalog";

/**
 * Enumerates normalized error categories produced by the application layer.
 */
export type ApplicationKind = Extract<
  Kind,
  | "Conflict"
  | "Forbidden"
  | "Internal"
  | "NotFound"
  | "RateLimit"
  | "Timeout"
  | "Unauthorized"
  | "Unavailable"
  | "Validation"
>;

/**
 * Shape used to describe an application-layer failure when constructing a
 * structured {@link Error}. All fields other than {@link kind} are optional so
 * callers can progressively add context (action, impact, hints, etc.).
 */
export type NewApplicationError = {
  code: ApplicationErrorCode;
  i18n?: ApplicationErrorI18n | undefined;
  kind: ApplicationKind;
} & ApplicationErrorBase;

type ApplicationErrorBase = Omit<
  NewRichError,
  "code" | "i18n" | "kind" | "layer"
>;

type NewApplicationErrorWithoutKind = Omit<NewApplicationError, "kind">;

/**
 * Application-layer error constructor wrapping @o3osatoshi/toolkit with layer "Application".
 * Use in application/use-case orchestration for consistent error classification.
 */
export function newApplicationError({
  code,
  i18n,
  kind,
  ...rest
}: NewApplicationError): RichError {
  return newRichError({
    code,
    i18n,
    ...rest,
    kind,
    layer: "Application",
  });
}

const withApplicationKind =
  (kind: ApplicationKind) =>
  (p: NewApplicationErrorWithoutKind): RichError =>
    newApplicationError({ kind, ...p });

/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Validation"`.
 */
export const applicationValidationError = withApplicationKind("Validation");
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="NotFound"`.
 */
export const applicationNotFoundError = withApplicationKind("NotFound");
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Conflict"`.
 */
export const applicationConflictError = withApplicationKind("Conflict");
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Forbidden"`.
 */
export const applicationForbiddenError = withApplicationKind("Forbidden");
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Unauthorized"`.
 */
export const applicationUnauthorizedError = withApplicationKind("Unauthorized");
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="RateLimit"`.
 */
export const applicationRateLimitError = withApplicationKind("RateLimit");
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Timeout"`.
 */
export const applicationTimeoutError = withApplicationKind("Timeout");
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Unavailable"`.
 */
export const applicationUnavailableError = withApplicationKind("Unavailable");
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Internal"`.
 */
export const applicationInternalError = withApplicationKind("Internal");
