import { newError as newBaseError } from "@o3osatoshi/toolkit";
import { Prisma } from "./prisma-client";

type NewPrismaError = {
  action?: string;
  impact?: string;
  hint?: string;
  cause?: unknown;
};

function isKnownRequestError(
  e: unknown,
): e is Prisma.PrismaClientKnownRequestError {
  return e instanceof Prisma.PrismaClientKnownRequestError;
}

function isValidationError(
  e: unknown,
): e is Prisma.PrismaClientValidationError {
  return e instanceof Prisma.PrismaClientValidationError;
}

function isUnknownRequestError(
  e: unknown,
): e is Prisma.PrismaClientUnknownRequestError {
  return e instanceof Prisma.PrismaClientUnknownRequestError;
}

function isInitializationError(
  e: unknown,
): e is Prisma.PrismaClientInitializationError {
  return e instanceof Prisma.PrismaClientInitializationError;
}

function isRustPanicError(e: unknown): e is Prisma.PrismaClientRustPanicError {
  return e instanceof Prisma.PrismaClientRustPanicError;
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
  impact,
  hint,
  cause,
}: NewPrismaError): Error {
  if (isKnownRequestError(cause)) {
    const code = cause.code;
    switch (code) {
      case "P2002": {
        // Unique constraint failed
        const meta = cause.meta as { target?: string | string[] } | undefined;
        const target = Array.isArray(meta?.target)
          ? meta?.target.join(", ")
          : meta?.target;
        return newBaseError({
          layer: "DB",
          kind: "Integrity",
          action,
          reason: target
            ? `Unique constraint violation on ${target}`
            : "Unique constraint violation",
          impact,
          hint: hint ?? "Use a different value for unique fields.",
          cause,
        });
      }
      case "P2025": {
        // Record not found
        const m = metaString(cause.meta, "cause");
        return newBaseError({
          layer: "DB",
          kind: "NotFound",
          action,
          reason: m ?? "Record not found",
          impact,
          hint: hint ?? "Verify where conditions or record id.",
          cause,
        });
      }
      case "P2003": {
        // Foreign key constraint failed
        return newBaseError({
          layer: "DB",
          kind: "Integrity",
          action,
          reason: "Foreign key constraint failed",
          impact,
          hint: hint ?? "Ensure related records exist before linking.",
          cause,
        });
      }
      case "P2000": {
        // Value too long for column
        const meta = cause.meta as { column_name?: string } | undefined;
        const column = meta?.column_name;
        return newBaseError({
          layer: "DB",
          kind: "Validation",
          action,
          reason: column ? `Value too long for ${column}` : "Value too long",
          impact,
          hint: hint ?? "Shorten value or alter schema.",
          cause,
        });
      }
      case "P2005": // Value out of range for the type
      case "P2006": {
        // Invalid value
        return newBaseError({
          layer: "DB",
          kind: "Validation",
          action,
          reason: code === "P2005" ? "Value out of range" : "Invalid value",
          impact,
          hint: hint ?? "Check data types and constraints.",
          cause,
        });
      }
      case "P2021": // Table does not exist
      case "P2022": {
        // Column does not exist
        return newBaseError({
          layer: "DB",
          kind: "Config",
          action,
          reason:
            code === "P2021" ? "Table does not exist" : "Column does not exist",
          impact,
          hint: hint ?? "Run migrations or verify schema.",
          cause,
        });
      }
      default: {
        return newBaseError({
          layer: "DB",
          kind: "Unknown",
          action,
          reason: `Known request error ${code}`,
          impact,
          hint,
          cause,
        });
      }
    }
  }

  if (isValidationError(cause)) {
    return newBaseError({
      layer: "DB",
      kind: "Validation",
      action,
      reason: "Invalid Prisma query or data",
      impact,
      hint: hint ?? "Check schema types and provided data.",
      cause,
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
      layer: "DB",
      kind,
      action,
      reason: msg,
      impact,
      hint:
        hint ??
        (kind === "Unavailable"
          ? "Ensure database is reachable and running."
          : kind === "Timeout"
            ? "Check database connectivity and network."
            : undefined),
      cause,
    });
  }

  if (isRustPanicError(cause)) {
    return newBaseError({
      layer: "DB",
      kind: "Unknown",
      action,
      reason: "Prisma engine panic",
      impact,
      hint: hint ?? "Inspect logs; restart the process.",
      cause,
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
      layer: "DB",
      kind,
      action,
      reason: msg,
      impact,
      hint,
      cause,
    });
  }

  // Fallback for non-Prisma errors: delegate to base newError with a sensible default.
  return newBaseError({
    layer: "DB",
    kind: "Unknown",
    action,
    reason: "Unexpected error",
    impact,
    hint,
    cause,
  });
}
