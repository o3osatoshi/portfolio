import type { Kind, RichError } from "@o3osatoshi/toolkit";

import {
  type ApplicationErrorI18n,
  applicationErrorI18nKeys,
} from "./application-error-catalog";

type MutableI18n = {
  i18n?: ApplicationErrorI18n | undefined;
};

/**
 * Ensure application-facing i18n metadata exists on a RichError.
 *
 * This function never wraps and always returns the same error instance.
 */
export function ensureApplicationErrorI18n(error: RichError): RichError {
  if (error.i18n?.key) {
    return error;
  }

  const resolved = resolveI18nByCode(error.code) ?? resolveI18nByKind(error.kind);

  const mutable = error as unknown as MutableI18n;
  mutable.i18n = resolved;
  return error;
}

function resolveI18nByCode(code: string | undefined): ApplicationErrorI18n | null {
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
