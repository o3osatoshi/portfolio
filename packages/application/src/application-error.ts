import {
  isRichError,
  type Kind,
  type NewRichError,
  newRichError,
  type RichError,
  toRichError,
} from "@o3osatoshi/toolkit";

import {
  type ApplicationErrorCode,
  type ApplicationErrorI18n,
  applicationErrorI18nKeys,
} from "./application-error-catalog";

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
  code: ApplicationErrorCode;
  i18n: ApplicationErrorI18n;
  kind: ApplicationKind;
} & ApplicationErrorBase;

/**
 * Payload used to normalize unknown downstream failures into application-layer
 * errors with origin-aware code/i18n metadata.
 */
export type ToApplicationError = {
  action: string;
  cause: unknown;
  code: ApplicationErrorCode;
  details?: Omit<NonNullable<NewRichError["details"]>, "action"> | undefined;
  i18n?: ApplicationErrorI18n | undefined;
  kind?: ApplicationKind | undefined;
  meta?: NewRichError["meta"];
};

type ApplicationErrorBase = Omit<
  NewRichError,
  "code" | "i18n" | "kind" | "layer"
>;

export function applicationI18nForKind(
  kind: ApplicationKind,
): ApplicationErrorI18n {
  switch (kind) {
    case "Conflict":
      return { key: applicationErrorI18nKeys.CONFLICT };
    case "Forbidden":
      return { key: applicationErrorI18nKeys.FORBIDDEN };
    case "NotFound":
      return { key: applicationErrorI18nKeys.NOT_FOUND };
    case "RateLimit":
      return { key: applicationErrorI18nKeys.RATE_LIMIT };
    case "Timeout":
      return { key: applicationErrorI18nKeys.TIMEOUT };
    case "Unauthorized":
      return { key: applicationErrorI18nKeys.UNAUTHORIZED };
    case "Unavailable":
      return { key: applicationErrorI18nKeys.UNAVAILABLE };
    case "Validation":
      return { key: applicationErrorI18nKeys.VALIDATION };
    case "Internal":
      return { key: applicationErrorI18nKeys.INTERNAL };
  }
}

/**
 * Application-layer error constructor wrapping @o3osatoshi/toolkit with layer "Application".
 * Use in application/use-case orchestration for consistent error classification.
 */
export function newApplicationError({
  code,
  i18n,
  kind,
  ...rest
}: NewApplicationError): RichError {
  return newRichError({
    code,
    i18n,
    ...rest,
    kind,
    layer: "Application",
  });
}

/**
 * Normalize unknown errors into Application-layer RichError.
 *
 * - Returns the original error when it is already an application error with i18n.
 * - Otherwise wraps the cause with stable `code`, normalized `kind`, and i18n.
 */
export function toApplicationError({
  action,
  cause,
  code,
  details,
  i18n,
  kind,
  meta,
}: ToApplicationError): RichError {
  if (isRichError(cause) && cause.layer === "Application" && cause.i18n?.key) {
    return cause;
  }

  const normalized = toRichError(cause, { layer: "Application" });
  const resolvedKind = kind ?? normalizeApplicationKind(normalized.kind);

  return newApplicationError({
    cause,
    code,
    details: {
      action,
      hint: details?.hint ?? normalized.details?.hint,
      impact: details?.impact ?? normalized.details?.impact,
      reason:
        details?.reason ?? normalized.details?.reason ?? normalized.message,
    },
    i18n: i18n ?? applicationI18nForKind(resolvedKind),
    isOperational: normalized.isOperational,
    kind: resolvedKind,
    meta: meta ?? normalized.meta,
  });
}

function normalizeApplicationKind(kind: Kind): ApplicationKind {
  switch (kind) {
    case "BadRequest":
    case "Unprocessable":
      return "Validation";
    case "BadGateway":
      return "Unavailable";
    case "Canceled":
    case "Timeout":
      return "Timeout";
    case "Conflict":
      return "Conflict";
    case "Forbidden":
      return "Forbidden";
    case "NotFound":
      return "NotFound";
    case "RateLimit":
      return "RateLimit";
    case "Unauthorized":
      return "Unauthorized";
    case "Unavailable":
      return "Unavailable";
    case "Validation":
      return "Validation";
    default:
      return "Internal";
  }
}
