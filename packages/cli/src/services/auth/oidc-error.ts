import { isRichError, newRichError, type RichError } from "@o3osatoshi/toolkit";

export type OidcErrorOptions = {
  action: string;
  code: string;
  kind?: RichError["kind"];
  reason: string;
};

export function newOidcError(
  options: OidcErrorOptions,
  cause?: unknown,
): RichError {
  return newRichError({
    cause,
    code: options.code,
    details: {
      action: options.action,
      reason: options.reason,
    },
    isOperational: true,
    kind: options.kind ?? "Internal",
    layer: "Presentation",
  });
}

export function remapOidcError(
  cause: RichError,
  options: OidcErrorOptions,
): RichError {
  const reason = toReason(cause, options.reason);
  const kind = options.kind ?? cause.kind;

  if (
    cause.code === options.code &&
    cause.details?.action === options.action &&
    cause.details?.reason === reason &&
    cause.kind === kind &&
    cause.layer === "Presentation"
  ) {
    return cause;
  }

  return newRichError({
    cause: cause.cause,
    code: options.code,
    details: {
      ...cause.details,
      action: options.action,
      reason,
    },
    i18n: cause.i18n,
    isOperational: cause.isOperational,
    kind,
    layer: "Presentation",
    meta: cause.meta,
  });
}

export function toReason(cause: unknown, fallback: string): string {
  if (isRichError(cause) && cause.details?.reason?.trim()) {
    return cause.details.reason;
  }
  if (cause instanceof Error && cause.message.trim().length > 0) {
    return cause.message;
  }
  return fallback;
}
