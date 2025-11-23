/**
 * Helpers for converting server-side `Error`s into HTTP-ready payloads.
 *
 * The primary entry point is {@link toHttpErrorResponse}, which returns a
 * serializable body and an appropriate status code. It also supports an
 * explicit status override and configurable serialization options.
 *
 * Default Kind → Status mapping used by this module:
 * - `BadRequest` / `Validation` → 400
 * - `Unauthorized` → 401
 * - `Forbidden` → 403
 * - `NotFound` → 404
 * - `MethodNotAllowed` → 405
 * - `RateLimit` → 429
 * - `Conflict` / `Integrity` / `Deadlock` → 409
 * - `Unprocessable` → 422
 * - `Canceled` → 408
 * - `Serialization` / `Config` / `Unknown` → 500
 * - `BadGateway` → 502
 * - `Unavailable` → 503
 * - `Timeout` → 504
 *
 * Heuristics:
 * - `ZodError` is treated as 400 (Validation).
 * - `AbortError` is treated as 408 (Canceled).
 *
 * Security: in development, {@link serializeError} may include stack traces.
 * Control this via the `includeStack` option.
 */
import {
  type Kind,
  parseErrorName,
  type SerializedError,
  serializeError,
  type SerializeOptions,
} from "../error";

/**
 * HTTP‑friendly error response.
 *
 * @public
 */
export type ErrorHttpResponse = {
  /** Serialized, JSON‑safe error payload produced by {@link serializeError}. */
  body: SerializedError;
  /** HTTP status code associated with the error. */
  statusCode: ErrorStatusCode;
};

/**
 * Status codes produced by {@link toHttpErrorResponse}.
 *
 * Values are restricted to common HTTP codes that map cleanly from error kinds
 * and interoperate well with popular runtimes/frameworks.
 *
 * @public
 */
export type ErrorStatusCode =
  | 400
  | 401
  | 403
  | 404
  | 405
  | 408
  | 409
  | 422
  | 429
  | 500
  | 502
  | 503
  | 504;

/** @internal Internal mapping from error Kind to HTTP status. */
const KIND_TO_STATUS: Record<Kind, ErrorStatusCode> = {
  Forbidden: 403,
  Validation: 400,
  BadGateway: 502,
  BadRequest: 400,
  Canceled: 408,
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
 * Convert an `Error` into an HTTP response shape.
 *
 * - `body` is a stable, JSON‑safe structure created by {@link serializeError}.
 * - `status` is inferred from `error.name` (see Kind → Status mapping), unless
 *   a specific status override is provided.
 *
 * @example
 * // Next.js Route Handler
 * ```ts
 * export async function GET() {
 *   try {
 *     // ...
 *   } catch (err) {
 *     const { body, status } = toHttpErrorResponse(err as Error);
 *     return Response.json(body, { status });
 *   }
 * }
 * ```
 *
 * @example
 * // Express middleware
 * ```ts
 * app.use((err, _req, res, _next) => {
 *   const { body, status } = toHttpErrorResponse(err);
 *   res.status(status).json(body);
 * });
 * ```
 *
 * @param error - Error instance to convert.
 * @param status - Optional HTTP status override. If provided, it takes precedence.
 * @param options - Serialization options (depth, includeStack, maxLen).
 * @returns A pair of `body` and `status` suitable for HTTP responses.
 * @public
 */
export function toHttpErrorResponse(
  error: Error,
  status?: ErrorStatusCode,
  options?: SerializeOptions,
): ErrorHttpResponse {
  const body = serializeError(error, options);
  return { body, statusCode: status ?? deriveStatusFromError(error) };
}

/** @internal Derive HTTP status from an Error name (Kind heuristic). */
function deriveStatusFromError(e: Error): ErrorStatusCode {
  const kind = detectKindFromName(e.name);
  if (kind) return KIND_TO_STATUS[kind];
  return 500;
}

/**
 * @internal Detect a {@link Kind} value from an error `name`.
 *
 * - Prioritizes names produced by {@link newError}, whose names are built as
 *   `Layer + Kind + "Error"` (e.g. `DomainValidationError`).
 * - Special‑cases external errors: `ZodError` and `AbortError`.
 */
function detectKindFromName(name: string): Kind | undefined {
  const { kind } = parseErrorName(name);
  if (kind) return kind;
  if (name === "ZodError") return "Validation";
  if (name === "AbortError") return "Canceled";
  return undefined;
}
