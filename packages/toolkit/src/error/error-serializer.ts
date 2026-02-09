import { err, ok, type Result } from "neverthrow";
import type { ZodIssue } from "zod";

import type { JsonObject } from "../types";
import {
  isRichError,
  newRichError,
  resolveErrorInfo,
  resolveOperationalFromKind,
  type RichError,
} from "./error";
import { coerceErrorMessage, extractErrorName } from "./error-attributes";
import {
  type Layer,
  type SerializedCause,
  type SerializedError,
  type SerializedRichError,
  serializedRichErrorSchema,
} from "./error-schema";

export type {
  SerializedCause,
  SerializedError,
  SerializedRichError,
} from "./error-schema";

/**
 * Failure payload returned by {@link tryDeserializeRichError}.
 *
 * @public
 */
export type DeserializeRichErrorFailure = {
  input: unknown;
  issues: DeserializeRichErrorIssue[];
};

/**
 * Single normalized validation issue produced while deserializing a RichError.
 *
 * @public
 */
export type DeserializeRichErrorIssue = {
  code: string;
  message: string;
  path: string;
};

/**
 * Options for {@link deserializeRichError}.
 *
 * @public
 */
export type DeserializeRichErrorOptions = {
  /**
   * Action label stored in the fallback RichError details.
   *
   * @defaultValue "DeserializeRichError"
   */
  action?: string | undefined;
  /**
   * Error code used when deserialization fails.
   *
   * @defaultValue "RICH_ERROR_DESERIALIZE_FAILED"
   */
  code?: string | undefined;
  /**
   * i18n key used when deserialization fails.
   *
   * @defaultValue "errors.transport.deserialize_failed"
   */
  i18nKey?: string | undefined;
  /**
   * Layer used for the fallback deserialization failure error.
   *
   * @defaultValue "External"
   */
  layer?: Layer | undefined;
  /**
   * Additional JSON-safe metadata merged into fallback deserialization errors.
   */
  meta?: JsonObject | undefined;
  /**
   * Optional source identifier added to fallback metadata.
   */
  source?: string | undefined;
};

/**
 * Tuning knobs for {@link serializeRichError}.
 *
 * @public
 */
export type SerializeOptions = {
  /** Maximum depth of `cause` chain to serialize (default: 2). */
  depth?: number | undefined;
  /** Include `stack` in output (default: true in development, false otherwise). */
  includeStack?: boolean | undefined;
};

/**
 * Deserialize a payload into {@link RichError}.
 *
 * @remarks
 * Uses {@link tryDeserializeRichError} internally. When strict deserialization
 * fails, this returns a structured `Serialization` RichError describing the
 * decode failure.
 *
 * @public
 */
export function deserializeRichError(
  input: unknown,
  options: DeserializeRichErrorOptions = {},
): RichError {
  const result = tryDeserializeRichError(input);
  if (result.isOk()) return result.value;

  const issues = result.error.issues;
  const metadata: JsonObject = {
    ...(options.meta ?? {}),
    ...(options.source ? { source: options.source } : {}),
    inputType: resolveInputType(input),
    issueCount: issues.length,
    issues,
  };

  return newRichError({
    cause: input,
    code: options.code ?? "RICH_ERROR_DESERIALIZE_FAILED",
    details: {
      action: options.action ?? "DeserializeRichError",
      reason: "Invalid serialized RichError payload.",
    },
    i18n: { key: options.i18nKey ?? "errors.transport.deserialize_failed" },
    isOperational: false,
    kind: "Serialization",
    layer: options.layer ?? "External",
    meta: metadata,
  });
}

/**
 * Lightweight structural guard for {@link SerializedError}.
 *
 * - Checks only for minimal shape (`name` and `message`).
 * - For strict RichError validation, prefer {@link tryDeserializeRichError}.
 *
 * @public
 */
export function isSerializedError(v: unknown): v is SerializedError {
  if (!v || typeof v !== "object") return false;
  const candidate = v as { message?: unknown; name?: unknown };
  return (
    typeof candidate.name === "string" && typeof candidate.message === "string"
  );
}

/**
 * Structural guard for strict serialized RichError payloads.
 *
 * @public
 */
export function isSerializedRichError(v: unknown): v is SerializedRichError {
  return serializedRichErrorSchema.safeParse(v).success;
}

/**
 * Convert a {@link RichError} into a JSON-safe transport payload.
 *
 * Behavior:
 * - Preserves `name` and `message`.
 * - Optionally includes `stack` (dev-only by default).
 * - Serializes nested `cause` recursively up to `depth`.
 *
 * @example
 * const s = serializeRichError(err); // send to worker or log store
 * const e = deserializeRichError(s); // rehydrate when payload is serialized RichError
 *
 * @public
 * @param error - RichError instance to serialize.
 * @param opts - Serialization options (depth, stack inclusion, truncation).
 * @returns A JSON-friendly error object suitable for transport or storage.
 */
export function serializeRichError(
  error: RichError,
  opts: SerializeOptions = {},
): SerializedRichError {
  const includeStack =
    opts.includeStack ?? process.env["NODE_ENV"] === "development";
  const depth = Math.max(0, opts.depth ?? 2);

  return {
    name: error.name,
    cause: serializeCause(error.cause, {
      depth: depth - 1,
      includeStack,
    }),
    code: error.code,
    details: error.details,
    i18n: error.i18n,
    isOperational: error.isOperational,
    kind: error.kind,
    layer: error.layer,
    message: error.message,
    meta: error.meta,
    stack: includeStack ? error.stack : undefined,
  };
}

/**
 * Strictly deserialize a serialized RichError payload.
 *
 * @remarks
 * - Accepts only payloads that satisfy {@link serializedRichErrorSchema}.
 * - Returns `Err` when the payload is invalid or does not represent a RichError.
 * - Use {@link deserializeRichError} when you always need a `RichError` return value.
 *
 * @public
 */
export function tryDeserializeRichError(
  input: unknown,
): Result<RichError, DeserializeRichErrorFailure> {
  if (isRichError(input)) return ok(input);

  const parsed = serializedRichErrorSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      input,
      issues: mapZodIssues(parsed.error.issues),
    });
  }

  const value = parsed.data;
  const rich = newRichError({
    cause: deserializeCause(value.cause),
    code: value.code ?? "RICH_ERROR_DESERIALIZED_WITHOUT_CODE",
    details: value.details,
    i18n: value.i18n,
    isOperational: value.isOperational,
    kind: value.kind,
    layer: value.layer,
    meta: value.meta,
  });

  if (value.message !== undefined) rich.message = value.message;
  if (value.stack !== undefined) rich.stack = value.stack;

  return ok(rich);
}

function buildError(message: string, cause: unknown): Error {
  try {
    return new (
      Error as unknown as new (
        m?: string,
        o?: { cause?: unknown },
      ) => Error
    )(message, cause !== undefined ? { cause } : undefined);
  } catch {
    const error = new Error(message);
    if (cause !== undefined) {
      try {
        Object.defineProperty(error, "cause", {
          enumerable: false,
          value: cause,
        });
      } catch {
        // ignore defineProperty failure
      }
    }
    return error;
  }
}

function deserializeCause(cause: SerializedCause | undefined): unknown {
  if (cause === undefined) return undefined;
  if (typeof cause === "string") return cause;
  return deserializeSerializedError(cause);
}

function deserializeSerializedError(value: SerializedError): Error {
  const cause = deserializeCause(value.cause);

  if (value.kind && value.layer) {
    const kind = value.kind;
    const rich = newRichError({
      cause,
      code: value.code ?? "RICH_ERROR_CAUSE_DESERIALIZED_WITHOUT_CODE",
      details: value.details,
      i18n: value.i18n,
      isOperational: value.isOperational ?? resolveOperationalFromKind(kind),
      kind,
      layer: value.layer,
      meta: value.meta,
    });
    if (value.message !== undefined) rich.message = value.message;
    if (value.stack !== undefined) rich.stack = value.stack;
    return rich;
  }

  const error = buildError(value.message, cause);
  error.name = value.name;
  if (value.stack !== undefined) error.stack = value.stack;
  return error;
}

function mapZodIssues(issues: ZodIssue[]): DeserializeRichErrorIssue[] {
  return issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path:
      issue.path.length > 0
        ? issue.path.map((segment) => String(segment)).join(".")
        : "<root>",
  }));
}

function resolveInputType(input: unknown): string {
  if (input === null) return "null";
  if (Array.isArray(input)) return "array";
  return typeof input;
}

/**
 * Serialize an `Error.cause` recursively with depth control.
 *
 * - Preserves primitive string causes as-is for compatibility.
 * - Serializes nested `Error` instances with rich details when available.
 * - When the configured `depth` is reached, returns a summarized string via {@link coerceErrorMessage}.
 * - Already serialized causes are passed through unchanged.
 *
 * @internal
 */
function serializeCause(
  cause: unknown,
  opts: SerializeOptions,
): SerializedCause | undefined {
  if (cause == null) return undefined;
  const depth = Math.max(0, opts.depth ?? 2);

  // Depth limit reached: return a summarized string
  if (depth === 0) {
    return coerceErrorMessage(cause);
  }

  // Preserve primitive string causes as-is for compatibility
  if (typeof cause === "string") return cause;

  // Error instances: serialize recursively first
  if (cause instanceof Error) {
    if (isRichError(cause)) {
      return serializeRichError(cause, {
        depth: depth - 1,
        includeStack: opts.includeStack,
      });
    }
    return serializeError(cause, {
      depth: depth - 1,
      includeStack: opts.includeStack,
    });
  }

  // Already-serialized payloads: pass through unchanged
  if (isSerializedError(cause)) return cause;

  // Non-error causes: coerce into a minimal SerializedError
  const name = extractErrorName(cause) ?? "Error";
  const message = coerceErrorMessage(cause);
  if (message) {
    return { name, message };
  } else {
    return name;
  }
}

function serializeError(
  error: Error,
  opts: SerializeOptions = {},
): SerializedError {
  const includeStack =
    opts.includeStack ?? process.env["NODE_ENV"] === "development";
  const depth = Math.max(0, opts.depth ?? 2);
  const info = resolveErrorInfo(error);

  return {
    name: error.name,
    cause: serializeCause(error.cause, {
      depth: depth - 1,
      includeStack,
    }),
    kind: info.kind,
    layer: info.layer,
    message: error.message,
    stack: includeStack ? error.stack : undefined,
  };
}
