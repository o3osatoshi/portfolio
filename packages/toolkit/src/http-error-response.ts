/**
 * HTTP response helpers for converting server-side Errors into
 * frontend-friendly payloads.
 *
 * The main export is {@link toHttpErrorResponse}, which:
 * - Serializes the provided `Error` into a stable, JSON-safe structure using
 *   {@link serializeError}, suitable for logs, workers, or API responses.
 * - Infers the most appropriate HTTP status code from the error `name` when no
 *   explicit status is provided. Errors produced via {@link newError} use a
 *   computed name of the form `Layer + Kind + "Error"` (for example
 *   `DomainValidationError`), and the `Kind` maps to an HTTP status as described below.
 *
 * Status mapping (Kind → HTTP status):
 * - `BadRequest` / `Validation` → 400
 * - `Unauthorized` → 401
 * - `Forbidden` → 403
 * - `NotFound` → 404
 * - `MethodNotAllowed` → 405
 * - `Conflict` / `Integrity` / `Deadlock` → 409
 * - `Unprocessable` → 422
 * - `RateLimit` → 429
 * - `Canceled` → 499 (non-standard but commonly used; override if needed)
 * - `Serialization` / `Config` / `Unknown` → 500
 * - `BadGateway` → 502
 * - `Unavailable` → 503
 * - `Timeout` → 504
 *
 * Additional heuristics:
 * - `ZodError` is treated as 400 (Validation).
 * - `AbortError` is treated as 499 (Canceled).
 *
 * Security: by default, `serializeError` includes stacks only in development.
 * To include or exclude stacks explicitly, pass `options.includeStack`.
 *
 * @module http-error-response
 */
import type { Kind } from "./error";
import { parseErrorName } from "./error-format";
import type { SerializeOptions } from "./error-serializer";
import { type SerializedError, serializeError } from "./error-serializer";

/**
 * Shape of an HTTP‑friendly error response.
 *
 * @public
 */
export type ErrorHttpResponse = {
  /** Serialized, JSON‑safe error payload produced by {@link serializeError}. */
  body: SerializedError;
  /** HTTP status code associated with the error. */
  status: number;
};

/** Internal mapping from logical error Kind to HTTP status. */
const KIND_TO_STATUS: Record<Kind, number> = {
  Forbidden: 403,
  Validation: 400,
  BadGateway: 502,
  BadRequest: 400,
  Canceled: 499, // Client Closed Request (non-standard, widely used)
  Config: 500,
  Conflict: 409,
  Deadlock: 409,
  Integrity: 409,
  MethodNotAllowed: 405,
  NotFound: 404,
  RateLimit: 429,
  Serialization: 500,
  Timeout: 504,
  Unauthorized: 401,
  Unavailable: 503,
  Unknown: 500,
  Unprocessable: 422,
};

/**
 * Convert an `Error` into an HTTP-friendly object with keys `body` and `status`.
 *
 * - `body` is produced via {@link serializeError}.
 * - `status` is inferred from `error.name` unless overridden.
 *
 * @example
 * ```ts
 * // Next.js Route Handler
 * export async function GET() {
 *   try {
 *     throw newError({ layer: "Application", kind: "NotFound" });
 *   } catch (err) {
 *     const { body, status } = toHttpErrorResponse(err as Error);
 *     return Response.json(body, { status });
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // Express
 * app.use((err, _req, res, _next) => {
 *   const { body, status } = toHttpErrorResponse(err);
 *   res.status(status).json(body);
 * });
 * ```
 *
 * @param error - Error instance to convert.
 * @param status - Optional HTTP status override. If provided, it takes precedence.
 * @param options - Optional serialization options (depth, includeStack, maxLen).
 * @returns {@link ErrorHttpResponse}
 * @public
 */
export function toHttpErrorResponse(
  error: Error,
  status?: number,
  options?: SerializeOptions,
): ErrorHttpResponse {
  const body = serializeError(error, options);
  return { body, status: status ?? deriveStatusFromError(error) };
}

/** Derive HTTP status from an Error name (Kind heuristic). */
function deriveStatusFromError(e: Error): number {
  const kind = detectKindFromName(e.name);
  if (kind) return KIND_TO_STATUS[kind];
  return 500;
}

/**
 * Detect a {@link Kind} value from an error `name`.
 *
 * - Prioritizes names produced by {@link newError}, whose names are built as
 *   `Layer + Kind + "Error"` (e.g. `DomainValidationError`).
 * - Special-cases external errors: `ZodError` and `AbortError`.
 */
function detectKindFromName(name: string): Kind | undefined {
  const { kind } = parseErrorName(name);
  if (kind) return kind;
  if (name === "ZodError") return "Validation";
  if (name === "AbortError") return "Canceled";
  return undefined;
}
