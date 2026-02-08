import type { RichErrorI18n } from "@o3osatoshi/toolkit";

/**
 * Stable machine-oriented codes for application-layer failures.
 *
 * These are consumed by control flow, logging, monitoring, and analytics.
 */
export const applicationErrorCodes = {
  CONFLICT: "APP_CONFLICT",
  FORBIDDEN: "APP_FORBIDDEN",
  INTERNAL: "APP_INTERNAL",
  NOT_FOUND: "APP_NOT_FOUND",
  RATE_LIMIT: "APP_RATE_LIMIT",
  STORE_PING_CONTEXT_PART_MISSING: "APP_STORE_PING_CONTEXT_PART_MISSING",
  STORE_PING_READBACK_NOT_FOUND: "APP_STORE_PING_READBACK_NOT_FOUND",
  TIMEOUT: "APP_TIMEOUT",
  TRANSACTION_NOT_FOUND: "APP_TRANSACTION_NOT_FOUND",
  TRANSACTION_UPDATE_FORBIDDEN: "APP_TRANSACTION_UPDATE_FORBIDDEN",
  UNAUTHORIZED: "APP_UNAUTHORIZED",
  UNAVAILABLE: "APP_UNAVAILABLE",
  VALIDATION: "APP_VALIDATION",
} as const;

/**
 * Machine code union used by application-layer errors.
 */
export type ApplicationErrorCode =
  (typeof applicationErrorCodes)[keyof typeof applicationErrorCodes];

/**
 * Allowed i18n keys for application-layer errors.
 *
 * Kept separate from `applicationErrorCodes` to preserve independent concerns:
 * - `code`: machine-oriented routing/observability
 * - `i18n.key`: user-facing translation lookup
 */
export const applicationErrorI18nKeys = {
  CONFLICT: "errors.application.conflict",
  FORBIDDEN: "errors.application.forbidden",
  INTERNAL: "errors.application.internal",
  NOT_FOUND: "errors.application.not_found",
  RATE_LIMIT: "errors.application.rate_limit",
  TIMEOUT: "errors.application.timeout",
  UNAUTHORIZED: "errors.application.unauthorized",
  UNAVAILABLE: "errors.application.unavailable",
  VALIDATION: "errors.application.validation",
} as const;

/**
 * i18n payload for application-layer errors.
 */
export type ApplicationErrorI18n = {
  key: ApplicationErrorI18nKey;
  params?: ApplicationErrorI18nParams | undefined;
};

/**
 * i18n key union used by application-layer errors.
 */
export type ApplicationErrorI18nKey =
  (typeof applicationErrorI18nKeys)[keyof typeof applicationErrorI18nKeys];

/**
 * Shared i18n params shape.
 */
export type ApplicationErrorI18nParams = NonNullable<RichErrorI18n["params"]>;
