import {
  type Kind,
  type NewRichError,
  newRichError,
  type RichError,
} from "@o3osatoshi/toolkit";

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
  kind: IntegrationKind;
} & Omit<NewRichError, "layer">;

/**
 * Integrations-aware error constructor. Shapes an Error using @o3osatoshi/toolkit
 * with layer "External". Prefer this over `newRichError` in integrations code.
 */
export function newIntegrationError({
  kind,
  ...rest
}: NewIntegrationError): RichError {
  return newRichError({
    ...rest,
    kind,
    layer: "External",
  });
}
