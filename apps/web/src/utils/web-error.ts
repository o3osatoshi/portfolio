import { type Kind, newRichError, type RichError } from "@o3osatoshi/toolkit";

/**
 * Stable machine-oriented codes for web presentation-layer failures.
 */
export const webErrorCodes = {
  AUTH_COOKIE_READ_FAILED: "WEB_AUTH_COOKIE_READ_FAILED",
  AUTH_TOKEN_DECODE_FAILED: "WEB_AUTH_TOKEN_DECODE_FAILED",
  AUTH_USER_ID_MISSING: "WEB_AUTH_USER_ID_MISSING",
  CACHE_READ_FAILED: "WEB_CACHE_READ_FAILED",
  CONFLICT: "WEB_CONFLICT",
  FORBIDDEN: "WEB_FORBIDDEN",
  INTERNAL: "WEB_INTERNAL",
  NOT_FOUND: "WEB_NOT_FOUND",
  RATE_LIMIT: "WEB_RATE_LIMIT",
  TIMEOUT: "WEB_TIMEOUT",
  UNAUTHORIZED: "WEB_UNAUTHORIZED",
  UNAVAILABLE: "WEB_UNAVAILABLE",
  VALIDATION: "WEB_VALIDATION",
} as const;

/**
 * Shape used to describe a presentation-layer failure when constructing a structured {@link Error}.
 */
export type NewWebError = {
  action?: string;
  cause?: unknown;
  code: WebErrorCode;
  hint?: string;
  impact?: string;
  kind: WebKind;
  reason?: string;
};

export type WebErrorCode = (typeof webErrorCodes)[keyof typeof webErrorCodes];

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
  code,
  hint,
  impact,
  kind,
  reason,
}: NewWebError): RichError {
  return newRichError({
    cause,
    code,
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
