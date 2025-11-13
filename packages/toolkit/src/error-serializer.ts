import { z } from "zod";

import { extractErrorMessage, extractErrorName } from "./error-attributes";

/**
 * Union used to represent an error's `cause` in serialized form.
 *
 * - A primitive `string` is preserved as-is.
 * - A nested {@link SerializedError} captures structured error details recursively.
 *
 * @public
 */
export type SerializedCause = SerializedError | string;

/**
 * JSON-friendly representation of an `Error` instance.
 *
 * Designed for cross-boundary transport (logs, workers, RPC) while keeping
 * payloads bounded and safe by default.
 *
 * @public
 */
export interface SerializedError {
  /** Optional cause; can be a string or another serialized error. */
  cause?: SerializedCause | undefined;
  /** Error message. */
  message: string;
  /** Original error name (e.g. `TypeError`, `DomainValidationError`). */
  name: string;
  /** Optional stack trace (included only when `includeStack` is true). */
  stack?: string | undefined;
}

/**
 * Tuning knobs for {@link serializeError}.
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
 * Reconstruct an `Error` instance from unknown input.
 *
 * - Validates the input against an internal Zod schema compatible with {@link SerializedError}.
 * - On schema success, restores `name`/`message`/`stack` and recursively rehydrates `cause`.
 * - On schema failure, builds a best-effort `Error` using {@link extractErrorName} and {@link extractErrorMessage}.
 * - If `input` is already an `Error`, it is returned as-is.
 * - Uses native `ErrorOptions` (`new Error(message, { cause })`) when available; otherwise attaches `cause` via `defineProperty`.
 *
 * @public
 * @param input - Unknown value expected to represent a serialized error.
 * @returns Rehydrated `Error` with best-effort `cause` restoration.
 */
export function deserializeError(input: unknown): Error {
  // If input is already an Error instance, return it as-is
  if (input instanceof Error) return input;

  const parsed = SerializedErrorSchema.safeParse(input);
  if (!parsed.success) {
    // Fallback: build a best-effort Error from unknown input
    const name = extractErrorName(input) ?? "UnknownError";
    const message = extractErrorMessage(input);
    const e = new Error(message);
    e.name = name;
    return e;
  }

  const value = parsed.data;
  const nested = value.cause;
  const cause =
    typeof nested === "string"
      ? nested
      : nested
        ? deserializeError(nested)
        : undefined;

  let error: Error;
  try {
    error = new (
      Error as unknown as new (
        m?: string,
        o?: { cause?: unknown },
      ) => Error
    )(value.message, cause !== undefined ? { cause } : undefined);
  } catch {
    error = new Error(value.message);
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
  }

  error.name = value.name;
  if (value.stack) error.stack = value.stack;
  return error;
}

/**
 * Lightweight structural guard for {@link SerializedError}.
 *
 * - Checks only for minimal shape (`name` and `message`).
 * - For strict validation and nested `cause` guarantees, prefer {@link deserializeError}.
 *
 * @public
 */
export function isSerializedError(v: unknown): v is SerializedError {
  return !!v && typeof v === "object" && "name" in v && "message" in v;
}

/**
 * Convert an `Error` into a {@link SerializedError}.
 *
 * Behavior:
 * - Preserves `name` and `message`.
 * - Optionally includes `stack` (dev-only by default).
 * - Serializes nested `cause` recursively up to `depth`.
 *
 * @example
 * const s = serializeError(err); // send to worker or log store
 * const e = deserializeError(s); // rehydrate in another process
 *
 * @public
 * @param error - Error instance to serialize.
 * @param opts - Serialization options (depth, stack inclusion, truncation).
 * @returns A JSON-friendly error object suitable for transport or storage.
 */
export function serializeError(
  error: Error,
  opts: SerializeOptions = {},
): SerializedError {
  const includeStack =
    opts.includeStack ?? process.env["NODE_ENV"] === "development";
  const depth = Math.max(0, opts.depth ?? 2);

  return {
    name: error.name,
    cause: serializeCause(error.cause, {
      depth: depth - 1,
      includeStack,
    }),
    message: error.message,
    stack: includeStack ? error.stack : undefined,
  };
}

/**
 * Serialize an `Error.cause` recursively with depth control.
 *
 * - Preserves primitive string causes as-is for compatibility.
 * - Serializes nested `Error` instances using {@link serializeError}.
 * - When the configured `depth` is reached, returns a summarized string via {@link extractErrorMessage}.
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
    return extractErrorMessage(cause);
  }

  // Preserve primitive string causes as-is for compatibility
  if (typeof cause === "string") return cause;

  // Error instances: serialize recursively first
  if (cause instanceof Error) {
    return serializeError(cause, {
      depth: depth - 1,
      includeStack: opts.includeStack,
    });
  }

  // Already-serialized payloads: pass through unchanged
  if (isSerializedError(cause)) return cause;

  // Non-error causes: coerce into a minimal SerializedError
  const name = extractErrorName(cause) ?? "Error";
  const message = extractErrorMessage(cause);
  if (message) {
    return { name, message };
  } else {
    return name;
  }
}

// Zod schema for validating SerializedError payloads (recursive, strips unknown keys)
const SerializedErrorSchema: z.ZodType<SerializedError> = z
  .object({
    name: z.string(),
    cause: z
      .union([z.string(), z.lazy(() => SerializedErrorSchema)])
      .optional(),
    message: z.string(),
    stack: z.string().optional(),
  })
  .strip();
