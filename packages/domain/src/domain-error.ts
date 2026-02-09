import {
  type Kind,
  type NewRichError,
  newRichError,
  type RichError,
} from "@o3osatoshi/toolkit";

import type { DomainErrorCode } from "./domain-error-catalog";

/**
 * Supported error categories emitted from the domain layer.
 */
export type DomainKind = Extract<
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
 * Payload describing a domain error when calling {@link newDomainError}.
 * Additional context can be attached incrementally for better diagnostics.
 */
export type NewDomainError = {
  code: DomainErrorCode;
  kind: DomainKind;
} & Omit<NewRichError, "layer">;

/**
 * Domain-aware error constructor. Shapes an Error using @o3osatoshi/toolkit with layer "Domain".
 * Prefer this over new Error(...) in domain code for consistent classification.
 */
export function newDomainError({ kind, ...rest }: NewDomainError): RichError {
  return newRichError({
    ...rest,
    kind,
    layer: "Domain",
  });
}
