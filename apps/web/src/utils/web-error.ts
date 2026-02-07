import { type Kind, newRichError, type RichError } from "@o3osatoshi/toolkit";

/**
 * Shape used to describe a presentation-layer failure when constructing a structured {@link Error}.
 */
export type NewWebError = {
  action?: string;
  cause?: unknown;
  hint?: string;
  impact?: string;
  kind: WebKind;
  reason?: string;
};

/**
 * Enumerates normalized error categories for the web presentation layer.
 */
export type WebKind = Extract<
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
 * Web presentation-layer error constructor wrapping @o3osatoshi/toolkit with layer "Presentation".
 * Prefer this helper in presentation code to keep error classification consistent.
 */
export function newWebError({
  action,
  cause,
  hint,
  impact,
  kind,
  reason,
}: NewWebError): RichError {
  return newRichError({
    cause,
    details: {
      action,
      hint,
      impact,
      reason,
    },
    kind,
    layer: "Presentation",
  });
}

/** Convenience wrapper for {@link newWebError} with `kind="Validation"`. */
export const webValidationError = (p: Omit<NewWebError, "kind">) =>
  newWebError({ kind: "Validation", ...p });
/** Convenience wrapper for {@link newWebError} with `kind="NotFound"`. */
export const webNotFoundError = (p: Omit<NewWebError, "kind">) =>
  newWebError({ kind: "NotFound", ...p });
/** Convenience wrapper for {@link newWebError} with `kind="Conflict"`. */
export const webConflictError = (p: Omit<NewWebError, "kind">) =>
  newWebError({ kind: "Conflict", ...p });
/** Convenience wrapper for {@link newWebError} with `kind="Forbidden"`. */
export const webForbiddenError = (p: Omit<NewWebError, "kind">) =>
  newWebError({ kind: "Forbidden", ...p });
/** Convenience wrapper for {@link newWebError} with `kind="Unauthorized"`. */
export const webUnauthorizedError = (p: Omit<NewWebError, "kind">) =>
  newWebError({ kind: "Unauthorized", ...p });
/** Convenience wrapper for {@link newWebError} with `kind="RateLimit"`. */
export const webRateLimitError = (p: Omit<NewWebError, "kind">) =>
  newWebError({ kind: "RateLimit", ...p });
/** Convenience wrapper for {@link newWebError} with `kind="Timeout"`. */
export const webTimeoutError = (p: Omit<NewWebError, "kind">) =>
  newWebError({ kind: "Timeout", ...p });
/** Convenience wrapper for {@link newWebError} with `kind="Unavailable"`. */
export const webUnavailableError = (p: Omit<NewWebError, "kind">) =>
  newWebError({ kind: "Unavailable", ...p });
/** Convenience wrapper for {@link newWebError} with `kind="Internal"`. */
export const webInternalError = (p: Omit<NewWebError, "kind">) =>
  newWebError({ kind: "Internal", ...p });
