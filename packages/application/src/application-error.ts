import { newError as baseNewError } from "@o3osatoshi/toolkit";

export type ApplicationKind =
  | "Conflict"
  | "Forbidden"
  | "NotFound"
  | "RateLimit"
  | "Timeout"
  | "Unauthorized"
  | "Unavailable"
  | "Unknown"
  | "Validation";

export type NewApplicationError = {
  action?: string;
  cause?: unknown;
  hint?: string;
  impact?: string;
  kind: ApplicationKind;
  reason?: string;
};

/**
 * Application-layer error constructor wrapping @o3osatoshi/toolkit with layer "Application".
 * Use in application/use-case orchestration for consistent error classification.
 */
export function newApplicationError({
  action,
  cause,
  hint,
  impact,
  kind,
  reason,
}: NewApplicationError): Error {
  return baseNewError({
    action,
    cause,
    hint,
    impact,
    kind,
    layer: "Application",
    reason,
  });
}

// Convenience helpers
export const applicationValidationError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Validation", ...p });
export const applicationNotFoundError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "NotFound", ...p });
export const applicationConflictError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Conflict", ...p });
export const applicationForbiddenError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Forbidden", ...p });
export const applicationUnauthorizedError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Unauthorized", ...p });
export const applicationRateLimitError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "RateLimit", ...p });
export const applicationTimeoutError = (p: Omit<NewApplicationError, "kind">) =>
  newApplicationError({ kind: "Timeout", ...p });
export const applicationUnavailableError = (
  p: Omit<NewApplicationError, "kind">,
) => newApplicationError({ kind: "Unavailable", ...p });
export const applicationUnknownError = (p: Omit<NewApplicationError, "kind">) =>
  newApplicationError({ kind: "Unknown", ...p });
