import { type Kind, newRichError, type RichError } from "@o3osatoshi/toolkit";

import {
  type ApplicationErrorI18n,
  applicationErrorI18nKeys,
} from "./application-error-catalog";

/**
 * Ensure application-facing i18n metadata exists on a RichError.
 *
 * Returns the original error when i18n is already present.
 * Otherwise returns an enriched RichError clone with preserved diagnostics.
 */
export function ensureApplicationErrorI18n(error: RichError): RichError {
  if (error.i18n?.key) {
    return error;
  }

  const richError = newRichError({
    cause: error.cause,
    code: error.code,
    details: error.details,
    i18n: resolveI18nByCode(error.code) ?? resolveI18nByKind(error.kind),
    isOperational: error.isOperational,
    kind: error.kind,
    layer: error.layer,
    meta: error.meta,
  });

  richError.message = error.message;
  if (error.stack !== undefined) {
    richError.stack = error.stack;
  }

  return richError;
}

function resolveI18nByCode(
  code: string | undefined,
): ApplicationErrorI18n | null {
  if (!code) return null;

  if (code.startsWith("DOM_") || code.startsWith("ZOD_")) {
    return { key: applicationErrorI18nKeys.VALIDATION };
  }

  if (code.startsWith("PRISMA_")) {
    if (code.includes("_NOT_FOUND")) {
      return { key: applicationErrorI18nKeys.NOT_FOUND };
    }

    if (code.startsWith("PRISMA_P2002") || code.startsWith("PRISMA_P2003")) {
      return { key: applicationErrorI18nKeys.CONFLICT };
    }

    if (code === "PRISMA_INIT_TIMEOUT") {
      return { key: applicationErrorI18nKeys.TIMEOUT };
    }

    if (code === "PRISMA_INIT_UNAUTHORIZED") {
      return { key: applicationErrorI18nKeys.UNAUTHORIZED };
    }

    if (code === "PRISMA_INIT_FORBIDDEN") {
      return { key: applicationErrorI18nKeys.FORBIDDEN };
    }

    if (code === "PRISMA_INIT_UNAVAILABLE") {
      return { key: applicationErrorI18nKeys.UNAVAILABLE };
    }

    if (code.includes("VALIDATION")) {
      return { key: applicationErrorI18nKeys.VALIDATION };
    }
  }

  if (
    code === "INT_EXTERNAL_RETRY_EXHAUSTED" ||
    code === "INT_EXCHANGE_RATE_API_HTTP_ERROR"
  ) {
    return { key: applicationErrorI18nKeys.UNAVAILABLE };
  }

  return null;
}

function resolveI18nByKind(kind: Kind): ApplicationErrorI18n {
  switch (kind) {
    case "BadRequest":
    case "Unprocessable":
    case "Validation":
      return { key: applicationErrorI18nKeys.VALIDATION };
    case "Conflict":
      return { key: applicationErrorI18nKeys.CONFLICT };
    case "Forbidden":
      return { key: applicationErrorI18nKeys.FORBIDDEN };
    case "NotFound":
      return { key: applicationErrorI18nKeys.NOT_FOUND };
    case "RateLimit":
      return { key: applicationErrorI18nKeys.RATE_LIMIT };
    case "Canceled":
    case "Timeout":
      return { key: applicationErrorI18nKeys.TIMEOUT };
    case "Unauthorized":
      return { key: applicationErrorI18nKeys.UNAUTHORIZED };
    case "BadGateway":
    case "Unavailable":
      return { key: applicationErrorI18nKeys.UNAVAILABLE };
    case "Internal":
    case "MethodNotAllowed":
    case "Serialization":
      return { key: applicationErrorI18nKeys.INTERNAL };
  }
}
