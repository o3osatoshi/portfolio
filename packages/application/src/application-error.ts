import {
  type Kind,
  type NewRichError,
  newRichError,
  type RichError,
} from "@o3osatoshi/toolkit";

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
  kind: ApplicationKind;
} & Omit<NewRichError, "layer">;

/**
 * Application-layer error constructor wrapping @o3osatoshi/toolkit with layer "Application".
 * Use in application/use-case orchestration for consistent error classification.
 */
export function newApplicationError({
  kind,
  ...rest
}: NewApplicationError): RichError {
  return newRichError({
    ...rest,
    kind,
    layer: "Application",
  });
}

/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Validation"`.
 */
export const applicationValidationError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Validation", ...p });
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="NotFound"`.
 */
export const applicationNotFoundError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "NotFound", ...p });
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Conflict"`.
 */
export const applicationConflictError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Conflict", ...p });
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Forbidden"`.
 */
export const applicationForbiddenError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Forbidden", ...p });
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Unauthorized"`.
 */
export const applicationUnauthorizedError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Unauthorized", ...p });
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="RateLimit"`.
 */
export const applicationRateLimitError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "RateLimit", ...p });
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Timeout"`.
 */
export const applicationTimeoutError = (p: Omit<NewApplicationError, "kind">) =>
  newApplicationError({ kind: "Timeout", ...p });
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Unavailable"`.
 */
export const applicationUnavailableError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Unavailable", ...p });
/**
 * Convenience wrapper for {@link newApplicationError} with `kind="Internal"`.
 */
export const applicationInternalError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Internal", ...p });
