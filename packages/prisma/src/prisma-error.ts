import { newError as newBaseError } from "@o3osatoshi/toolkit";

import { Prisma } from "./prisma-client";

/**
 * Context passed to {@link newPrismaError} before classifying the Prisma error.
 */
type NewPrismaError = {
  action?: string;
  cause?: unknown;
  hint?: string;
  impact?: string;
};

/**
 * Prisma-aware newError override.
 *
 * Maps common Prisma error classes/codes to a stable error shape and delegates
 * to `@o3osatoshi/toolkit`'s `newError` with `layer: "DB"` and an appropriate `kind`.
 *
 * Major mappings
 * - P2002: kind=Integrity, reason=Unique constraint violation (meta.target is shown if present)
 * - P2025: kind=NotFound, reason=Record not found (meta.cause if present)
 * - P2003: kind=Integrity, reason=Foreign key constraint failed
 * - P2000: kind=Validation, reason=Value too long (column name if present)
 * - P2005/P2006: kind=Validation, reason=Value out of range / Invalid value
 * - P2021/P2022: kind=Config, reason=Table / Column does not exist
 * - PrismaClientValidationError: kind=Validation
 * - PrismaClientInitializationError: kind=Unavailable / Timeout / Unauthorized / Forbidden / Unknown (derived from message)
 * - PrismaClientUnknownRequestError: kind=Deadlock / Serialization / Unknown (derived from message)
 * - PrismaClientRustPanicError: kind=Unknown
 *
 * Notes
 * - This helper summarizes the original cause into the message. It does not attach the raw cause object.
 *
 * @param action - High-level operation name (e.g., "CreateUser").
 * @param impact - Optional description of effect on the system.
 * @param hint - Optional remediation tip for operators/users.
 * @param cause - The original Prisma error (or unknown) to classify.
 * @returns Error shaped by `@o3osatoshi/toolkit`'s `newError` with layer `DB`.
 */
export function newPrismaError({
  action,
  cause,
  hint,
  impact,
}: NewPrismaError): Error {
  if (isKnownRequestError(cause)) {
    const code = cause.code;
    switch (code) {
      case "P2000": {
        // Value too long for column
        const meta = cause.meta as { column_name?: string } | undefined;
        const column = meta?.column_name;
        return newBaseError({
          action,
          cause,
          hint: hint ?? "Shorten value or alter schema.",
          impact,
          kind: "Validation",
          layer: "DB",
          reason: column ? `Value too long for ${column}` : "Value too long",
        });
      }
      case "P2002": {
        // Unique constraint failed
        const meta = cause.meta as { target?: string | string[] } | undefined;
        const target = Array.isArray(meta?.target)
          ? meta?.target.join(", ")
          : meta?.target;
        return newBaseError({
          action,
          cause,
          hint: hint ?? "Use a different value for unique fields.",
          impact,
          kind: "Integrity",
          layer: "DB",
          reason: target
            ? `Unique constraint violation on ${target}`
            : "Unique constraint violation",
        });
      }
      case "P2003": {
        // Foreign key constraint failed
        return newBaseError({
          action,
          cause,
          hint: hint ?? "Ensure related records exist before linking.",
          impact,
          kind: "Integrity",
          layer: "DB",
          reason: "Foreign key constraint failed",
        });
      }
      case "P2005": // Value out of range for the type
      case "P2006": {
        // Invalid value
        return newBaseError({
          action,
          cause,
          hint: hint ?? "Check data types and constraints.",
          impact,
          kind: "Validation",
          layer: "DB",
          reason: code === "P2005" ? "Value out of range" : "Invalid value",
        });
      }
      case "P2021": // Table does not exist
      case "P2022": {
        // Column does not exist
        return newBaseError({
          action,
          cause,
          hint: hint ?? "Run migrations or verify schema.",
          impact,
          kind: "Config",
          layer: "DB",
          reason:
            code === "P2021" ? "Table does not exist" : "Column does not exist",
        });
      }
      case "P2025": {
        // Record not found
        const m = metaString(cause.meta, "cause");
        return newBaseError({
          action,
          cause,
          hint: hint ?? "Verify where conditions or record id.",
          impact,
          kind: "NotFound",
          layer: "DB",
          reason: m ?? "Record not found",
        });
      }
      default: {
        return newBaseError({
          action,
          cause,
          hint,
          impact,
          kind: "Unknown",
          layer: "DB",
          reason: `Known request error ${code}`,
        });
      }
    }
  }

  if (isValidationError(cause)) {
    return newBaseError({
      action,
      cause,
      hint: hint ?? "Check schema types and provided data.",
      impact,
      kind: "Validation",
      layer: "DB",
      reason: "Invalid Prisma query or data",
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
              : "Unknown";

    return newBaseError({
      action,
      cause,
      hint:
        hint ??
        (kind === "Unavailable"
          ? "Ensure database is reachable and running."
          : kind === "Timeout"
            ? "Check database connectivity and network."
            : undefined),
      impact,
      kind,
      layer: "DB",
      reason: msg,
    });
  }

  if (isRustPanicError(cause)) {
    return newBaseError({
      action,
      cause,
      hint: hint ?? "Inspect logs; restart the process.",
      impact,
      kind: "Unknown",
      layer: "DB",
      reason: "Prisma engine panic",
    });
  }

  if (isUnknownRequestError(cause)) {
    const msg = String(cause.message || "Unknown Prisma request error");
    const lower = msg.toLowerCase();
    const kind = lower.includes("deadlock")
      ? "Deadlock"
      : lower.includes("could not serialize access") ||
          lower.includes("serialization failure")
        ? "Serialization"
        : "Unknown";
    return newBaseError({
      action,
      cause,
      hint,
      impact,
      kind,
      layer: "DB",
      reason: msg,
    });
  }

  // Fallback for non-Prisma errors: delegate to base newError with a sensible default.
  return newBaseError({
    action,
    cause,
    hint,
    impact,
    kind: "Unknown",
    layer: "DB",
    reason: "Unexpected error",
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

/** Type guard for Prisma validation errors thrown before hitting the DB. */
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
