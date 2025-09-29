import { newError as baseNewError } from "@o3osatoshi/toolkit";

/**
 * Supported error categories emitted from the domain layer.
 */
export type DomainKind =
  | "Conflict"
  | "Forbidden"
  | "NotFound"
  | "RateLimit"
  | "Timeout"
  | "Unauthorized"
  | "Unavailable"
  | "Unknown"
  | "Validation";

/**
 * Payload describing a domain error when calling {@link newDomainError}.
 * Additional context can be attached incrementally for better diagnostics.
 */
export type NewDomainError = {
  action?: string;
  cause?: unknown;
  hint?: string;
  impact?: string;
  kind: DomainKind;
  reason?: string;
};

/**
 * Domain-aware error constructor. Shapes an Error using @o3osatoshi/toolkit with layer "Domain".
 * Prefer this over new Error(...) in domain code for consistent classification.
 */
export function newDomainError({
  action,
  cause,
  hint,
  impact,
  kind,
  reason,
}: NewDomainError): Error {
  return baseNewError({
    action,
    cause,
    hint,
    impact,
    kind,
    layer: "Domain",
    reason,
  });
}

/** Convenience wrapper for {@link newDomainError} with `kind="Validation"`. */
export const domainValidationError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Validation", ...p });
/** Convenience wrapper for {@link newDomainError} with `kind="NotFound"`. */
export const domainNotFoundError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "NotFound", ...p });
/** Convenience wrapper for {@link newDomainError} with `kind="Conflict"`. */
export const domainConflictError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Conflict", ...p });
/** Convenience wrapper for {@link newDomainError} with `kind="Forbidden"`. */
export const domainForbiddenError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Forbidden", ...p });
/** Convenience wrapper for {@link newDomainError} with `kind="Unauthorized"`. */
export const domainUnauthorizedError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Unauthorized", ...p });
/** Convenience wrapper for {@link newDomainError} with `kind="RateLimit"`. */
export const domainRateLimitError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "RateLimit", ...p });
/** Convenience wrapper for {@link newDomainError} with `kind="Timeout"`. */
export const domainTimeoutError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Timeout", ...p });
/** Convenience wrapper for {@link newDomainError} with `kind="Unavailable"`. */
export const domainUnavailableError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Unavailable", ...p });
/** Convenience wrapper for {@link newDomainError} with `kind="Unknown"`. */
export const domainUnknownError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Unknown", ...p });
