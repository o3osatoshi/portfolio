import { type Kind, newError } from "@o3osatoshi/toolkit";

/**
 * Supported error categories emitted from the integrations layer.
 */
export type IntegrationKind = Extract<
  Kind,
  | "BadGateway"
  | "BadRequest"
  | "Canceled"
  | "Config"
  | "Conflict"
  | "Forbidden"
  | "MethodNotAllowed"
  | "NotFound"
  | "RateLimit"
  | "Serialization"
  | "Timeout"
  | "Unauthorized"
  | "Unavailable"
  | "Unknown"
  | "Unprocessable"
  | "Validation"
>;

/**
 * Payload describing an integrations error when calling {@link newIntegrationError}.
 * Additional context can be attached incrementally for better diagnostics.
 */
export type NewIntegrationError = {
  action?: string;
  cause?: unknown;
  hint?: string;
  impact?: string;
  kind: IntegrationKind;
  reason?: string;
};

/**
 * Integrations-aware error constructor. Shapes an Error using @o3osatoshi/toolkit
 * with layer "External". Prefer this over `newError` in integrations code.
 */
export function newIntegrationError({
  action,
  cause,
  hint,
  impact,
  kind,
  reason,
}: NewIntegrationError): Error {
  return newError({
    action,
    cause,
    hint,
    impact,
    kind,
    layer: "External",
    reason,
  });
}
