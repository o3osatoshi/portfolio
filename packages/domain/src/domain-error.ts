import { newError as baseNewError } from "@o3osatoshi/toolkit";

export type DomainKind =
  | "Validation"
  | "NotFound"
  | "Conflict"
  | "Forbidden"
  | "Unauthorized"
  | "RateLimit"
  | "Timeout"
  | "Unavailable"
  | "Unknown";

export type NewDomainError = {
  kind: DomainKind;
  action?: string;
  reason?: string;
  impact?: string;
  hint?: string;
  cause?: unknown;
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

// Convenience helpers
export const domainValidationError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Validation", ...p });
export const domainNotFoundError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "NotFound", ...p });
export const domainConflictError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Conflict", ...p });
export const domainForbiddenError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Forbidden", ...p });
export const domainUnauthorizedError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Unauthorized", ...p });
export const domainRateLimitError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "RateLimit", ...p });
export const domainTimeoutError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Timeout", ...p });
export const domainUnavailableError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Unavailable", ...p });
export const domainUnknownError = (p: Omit<NewDomainError, "kind">) =>
  newDomainError({ kind: "Unknown", ...p });
