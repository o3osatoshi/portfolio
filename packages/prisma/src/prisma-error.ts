import {
  type NewRichError,
  newRichError,
  type RichError,
  type RichErrorDetails,
} from "@o3osatoshi/toolkit";

import { Prisma } from "../generated/prisma/client";

/**
 * Context passed to {@link newPrismaError} before classifying the Prisma error.
 */
type NewPrismaError = {
  details?: RichErrorDetails | undefined;
  isOperational?: boolean | undefined;
} & Omit<NewRichError, "details" | "isOperational" | "kind" | "layer">;

/**
 * Prisma-aware newRichError override.
 *
 * Maps common Prisma error classes/codes to a stable error shape and delegates
 * to `@o3osatoshi/toolkit`'s `newRichError` with `layer: "Persistence"` and an appropriate `kind`.
 *
 * Major mappings
 * - P2002: kind=Conflict, reason=Unique constraint violation (meta.target is shown if present)
 * - P2025: kind=NotFound, reason=Record not found (meta.cause if present)
 * - P2003: kind=Conflict, reason=Foreign key constraint failed
 * - P2000: kind=Validation, reason=Value too long (column name if present)
 * - P2005/P2006: kind=Validation, reason=Value out of range / Invalid value
 * - P2021/P2022: kind=Internal, reason=Table / Column does not exist
 * - PrismaClientValidationError: kind=Validation
 * - PrismaClientInitializationError: kind=Unavailable / Timeout / Unauthorized / Forbidden / Internal (derived from message)
 * - PrismaClientUnknownRequestError: kind=Conflict / Serialization / Internal (derived from message)
 * - PrismaClientRustPanicError: kind=Internal
 *
 * Notes
 * - The original cause is preserved on the returned error.
 *
 * @param action - High-level operation name (e.g., "CreateUser").
 * @param impact - Optional description of effect on the system.
 * @param hint - Optional remediation tip for operators/users.
 * @param cause - The original Prisma error (or unknown) to classify.
 * @returns Error shaped by `@o3osatoshi/toolkit`'s `newRichError` with layer `Persistence`.
 */
export function newPrismaError({
  cause,
  details,
  ...rest
}: NewPrismaError): RichError {
  const mergeDetails = ({
    hint,
    reason,
  }: {
    hint?: string | undefined;
    reason: string;
  }): RichErrorDetails => ({
    ...details,
    hint: details?.hint ?? hint,
    reason: details?.reason ?? reason,
  });
  const resolveCode = (fallback: string): string => rest.code ?? fallback;
  const resolveOperational = (kind: NewRichError["kind"]) =>
    rest.isOperational ?? (kind !== "Internal" && kind !== "Serialization");
  const resolveMeta = ({
    kind,
    prismaCode,
    prismaColumn,
    prismaNotFoundCause,
    prismaTarget,
  }: {
    kind: NewRichError["kind"];
    prismaCode?: string | undefined;
    prismaColumn?: string | undefined;
    prismaNotFoundCause?: string | undefined;
    prismaTarget?: string | undefined;
  }): NewRichError["meta"] =>
    resolvePrismaMeta({
      cause,
      kind,
      prismaCode,
      prismaColumn,
      prismaNotFoundCause,
      prismaTarget,
      userMeta: rest.meta,
    });

  if (isKnownRequestError(cause)) {
    const code = cause.code;
    switch (code) {
      case "P2000": {
        // Value too long for column
        const meta = cause.meta as { column_name?: string } | undefined;
        const column = meta?.column_name;
        return newRichError({
          ...rest,
          cause,
          code: resolveCode("PRISMA_P2000_VALUE_TOO_LONG"),
          details: mergeDetails({
            hint: "Shorten value or alter schema.",
            reason: column ? `Value too long for ${column}` : "Value too long",
          }),
          isOperational: resolveOperational("Validation"),
          kind: "Validation",
          layer: "Persistence",
          meta: resolveMeta({
            kind: "Validation",
            prismaCode: code,
            prismaColumn: column,
          }),
        });
      }
      case "P2002": {
        // Unique constraint failed
        const meta = cause.meta as { target?: string | string[] } | undefined;
        const target = Array.isArray(meta?.target)
          ? meta?.target.join(", ")
          : meta?.target;
        return newRichError({
          ...rest,
          cause,
          code: resolveCode("PRISMA_P2002_UNIQUE_CONSTRAINT"),
          details: mergeDetails({
            hint: "Use a different value for unique fields.",
            reason: target
              ? `Unique constraint violation on ${target}`
              : "Unique constraint violation",
          }),
          isOperational: resolveOperational("Conflict"),
          kind: "Conflict",
          layer: "Persistence",
          meta: resolveMeta({
            kind: "Conflict",
            prismaCode: code,
            prismaTarget: target,
          }),
        });
      }
      case "P2003": {
        // Foreign key constraint failed
        return newRichError({
          ...rest,
          cause,
          code: resolveCode("PRISMA_P2003_FOREIGN_KEY_CONSTRAINT"),
          details: mergeDetails({
            hint: "Ensure related records exist before linking.",
            reason: "Foreign key constraint failed",
          }),
          isOperational: resolveOperational("Conflict"),
          kind: "Conflict",
          layer: "Persistence",
          meta: resolveMeta({
            kind: "Conflict",
            prismaCode: code,
          }),
        });
      }
      case "P2005": // Value out of range for the type
      case "P2006": {
        // Invalid value
        return newRichError({
          ...rest,
          cause,
          code: resolveCode(
            code === "P2005"
              ? "PRISMA_P2005_VALUE_OUT_OF_RANGE"
              : "PRISMA_P2006_INVALID_VALUE",
          ),
          details: mergeDetails({
            hint: "Check data types and constraints.",
            reason: code === "P2005" ? "Value out of range" : "Invalid value",
          }),
          isOperational: resolveOperational("Validation"),
          kind: "Validation",
          layer: "Persistence",
          meta: resolveMeta({
            kind: "Validation",
            prismaCode: code,
          }),
        });
      }
      case "P2021": // Table does not exist
      case "P2022": {
        // Column does not exist
        return newRichError({
          ...rest,
          cause,
          code: resolveCode(
            code === "P2021"
              ? "PRISMA_P2021_TABLE_NOT_FOUND"
              : "PRISMA_P2022_COLUMN_NOT_FOUND",
          ),
          details: mergeDetails({
            hint: "Run migrations or verify schema.",
            reason:
              code === "P2021"
                ? "Table does not exist"
                : "Column does not exist",
          }),
          isOperational: resolveOperational("Internal"),
          kind: "Internal",
          layer: "Persistence",
          meta: resolveMeta({
            kind: "Internal",
            prismaCode: code,
          }),
        });
      }
      case "P2025": {
        // Record not found
        const m = metaString(cause.meta, "cause");
        return newRichError({
          ...rest,
          cause,
          code: resolveCode("PRISMA_P2025_RECORD_NOT_FOUND"),
          details: mergeDetails({
            hint: "Verify where conditions or record id.",
            reason: m ?? "Record not found",
          }),
          isOperational: resolveOperational("NotFound"),
          kind: "NotFound",
          layer: "Persistence",
          meta: resolveMeta({
            kind: "NotFound",
            prismaCode: code,
            prismaNotFoundCause: m,
          }),
        });
      }
      default: {
        return newRichError({
          ...rest,
          cause,
          code: resolveCode(`PRISMA_${code}_KNOWN_REQUEST_ERROR`),
          details: mergeDetails({
            reason: `Known request error ${code}`,
          }),
          isOperational: resolveOperational("Internal"),
          kind: "Internal",
          layer: "Persistence",
          meta: resolveMeta({
            kind: "Internal",
            prismaCode: code,
          }),
        });
      }
    }
  }

  if (isValidationError(cause)) {
    return newRichError({
      ...rest,
      cause,
      code: resolveCode("PRISMA_VALIDATION_ERROR"),
      details: mergeDetails({
        hint: "Check schema types and provided data.",
        reason: "Invalid Prisma query or data",
      }),
      isOperational: resolveOperational("Validation"),
      kind: "Validation",
      layer: "Persistence",
      meta: resolveMeta({
        kind: "Validation",
      }),
    });
  }

  if (isInitializationError(cause)) {
    const msg = String(cause.message || "Initialization error");
    const lower = msg.toLowerCase();
    const kind =
      lower.includes("p1001") ||
      lower.includes("could not connect") ||
      lower.includes("connection refused") ||
      lower.includes("closed the connection") ||
      lower.includes("p1017")
        ? "Unavailable"
        : lower.includes("p1002") ||
            lower.includes("p1008") ||
            lower.includes("timeout") ||
            lower.includes("timed out")
          ? "Timeout"
          : lower.includes("authentication failed") || lower.includes("p1000")
            ? "Unauthorized"
            : lower.includes("permission denied")
              ? "Forbidden"
              : "Internal";

    return newRichError({
      ...rest,
      cause,
      code: resolveCode(`PRISMA_INIT_${kind.toUpperCase()}`),
      details: mergeDetails({
        hint:
          kind === "Unavailable"
            ? "Ensure database is reachable and running."
            : kind === "Timeout"
              ? "Check database connectivity and network."
              : undefined,
        reason: msg,
      }),
      isOperational: resolveOperational(kind),
      kind,
      layer: "Persistence",
      meta: resolveMeta({
        kind,
      }),
    });
  }

  if (isRustPanicError(cause)) {
    return newRichError({
      ...rest,
      cause,
      code: resolveCode("PRISMA_RUST_PANIC"),
      details: mergeDetails({
        hint: "Inspect logs; restart the process.",
        reason: "Prisma engine panic",
      }),
      isOperational: resolveOperational("Internal"),
      kind: "Internal",
      layer: "Persistence",
      meta: resolveMeta({
        kind: "Internal",
      }),
    });
  }

  if (isUnknownRequestError(cause)) {
    const msg = String(cause.message || "Unknown Prisma request error");
    const lower = msg.toLowerCase();
    const kind = lower.includes("deadlock")
      ? "Conflict"
      : lower.includes("could not serialize access") ||
          lower.includes("serialization failure")
        ? "Serialization"
        : "Internal";
    return newRichError({
      ...rest,
      cause,
      code: resolveCode(`PRISMA_UNKNOWN_REQUEST_${kind.toUpperCase()}`),
      details: mergeDetails({
        reason: msg,
      }),
      isOperational: resolveOperational(kind),
      kind,
      layer: "Persistence",
      meta: resolveMeta({
        kind,
      }),
    });
  }

  // Fallback for non-Prisma errors: delegate to base newRichError with a sensible default.
  return newRichError({
    ...rest,
    cause,
    code: resolveCode("PRISMA_UNEXPECTED_ERROR"),
    details: mergeDetails({
      reason: "Unexpected error",
    }),
    isOperational: resolveOperational("Internal"),
    kind: "Internal",
    layer: "Persistence",
    meta: resolveMeta({
      kind: "Internal",
    }),
  });
}

/** Type guard for initialization errors (connection issues, auth failures, etc.). */
function isInitializationError(
  e: unknown,
): e is Prisma.PrismaClientInitializationError {
  return e instanceof Prisma.PrismaClientInitializationError;
}

/** Type guard for Prisma errors carrying a `code` property. */
function isKnownRequestError(
  e: unknown,
): e is Prisma.PrismaClientKnownRequestError {
  return e instanceof Prisma.PrismaClientKnownRequestError;
}

/** Type guard for low-level engine panics during Prisma execution. */
function isRustPanicError(e: unknown): e is Prisma.PrismaClientRustPanicError {
  return e instanceof Prisma.PrismaClientRustPanicError;
}

/** Type guard for Prisma errors surfaced as "unknown request errors". */
function isUnknownRequestError(
  e: unknown,
): e is Prisma.PrismaClientUnknownRequestError {
  return e instanceof Prisma.PrismaClientUnknownRequestError;
}

/** Type guard for Prisma validation errors thrown before hitting persistence. */
function isValidationError(
  e: unknown,
): e is Prisma.PrismaClientValidationError {
  return e instanceof Prisma.PrismaClientValidationError;
}

/**
 * Safely read a string property from a possibly-unknown `meta` object.
 * Avoids using `any` and works with Prisma's loosely-typed `meta` payloads.
 */
function metaString(meta: unknown, key: string): string | undefined {
  if (meta && typeof meta === "object") {
    const value = (meta as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

function resolvePrismaMeta({
  cause,
  kind,
  prismaCode,
  prismaColumn,
  prismaNotFoundCause,
  prismaTarget,
  userMeta,
}: {
  cause: unknown;
  kind: NewRichError["kind"];
  prismaCode?: string | undefined;
  prismaColumn?: string | undefined;
  prismaNotFoundCause?: string | undefined;
  prismaTarget?: string | undefined;
  userMeta: NewRichError["meta"];
}): NewRichError["meta"] {
  return {
    prismaSource: "prisma.newPrismaError",
    prismaErrorClass: resolvePrismaErrorClass(cause),
    prismaKind: kind,
    ...(prismaCode ? { prismaCode } : {}),
    ...(prismaColumn ? { prismaColumn } : {}),
    ...(prismaTarget ? { prismaTarget } : {}),
    ...(prismaNotFoundCause ? { prismaNotFoundCause } : {}),
    ...(userMeta ?? {}),
  };
}

function resolvePrismaErrorClass(cause: unknown): string {
  if (isKnownRequestError(cause)) return "PrismaClientKnownRequestError";
  if (isValidationError(cause)) return "PrismaClientValidationError";
  if (isInitializationError(cause)) return "PrismaClientInitializationError";
  if (isRustPanicError(cause)) return "PrismaClientRustPanicError";
  if (isUnknownRequestError(cause)) return "PrismaClientUnknownRequestError";
  return "Unknown";
}
