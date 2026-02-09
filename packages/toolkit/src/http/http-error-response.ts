/**
 * Helpers for converting unknown error-like values into HTTP-ready payloads.
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
 * - `Conflict` → 409
 * - `Unprocessable` → 422
 * - `Canceled` → 408
 * - `Serialization` / `Internal` → 500
 * - `BadGateway` → 502
 * - `Unavailable` → 503
 * - `Timeout` → 504
 *
 * Security: in development, {@link serializeRichError} may include stack traces.
 * Control this via the `includeStack` option.
 */
import {
  type Kind,
  type SerializedError,
  type SerializeOptions,
  serializeRichError,
  toRichError,
} from "../error";

/**
 * HTTP‑friendly error response.
 *
 * @public
 */
export type ErrorHttpResponse = {
  /** Serialized, JSON‑safe error payload produced by {@link serializeRichError}. */
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
  Conflict: 409,
  Internal: 500,
  MethodNotAllowed: 405,
  NotFound: 404,
  RateLimit: 429,
  Serialization: 500,
  Timeout: 504,
  Unauthorized: 401,
  Unavailable: 503,
  Unprocessable: 422,
};

/**
 * Convert an unknown error-like value into an HTTP response shape.
 *
 * - `body` is a stable, JSON‑safe structure created by {@link serializeRichError}.
 * - `status` is inferred from normalized `RichError.kind` (see Kind → Status
 *   mapping), unless a specific status override is provided.
 *
 * @example
 * // Next.js Route Handler
 * ```ts
 * export async function GET() {
 *   try {
 *     // ...
 *   } catch (err) {
 *     const { body, statusCode } = toHttpErrorResponse(err);
 *     return Response.json(body, { status: statusCode });
 *   }
 * }
 * ```
 *
 * @example
 * // Express middleware
 * ```ts
 * app.use((err, _req, res, _next) => {
 *   const { body, statusCode } = toHttpErrorResponse(err);
 *   res.status(statusCode).json(body);
 * });
 * ```
 *
 * @param error - Unknown value to convert into a structured error response.
 * @param status - Optional HTTP status override. If provided, it takes precedence.
 * @param options - Serialization options (depth, includeStack).
 * @returns A pair of `body` and `statusCode` suitable for HTTP responses.
 * @public
 */
export function toHttpErrorResponse(
  error: unknown,
  status?: ErrorStatusCode,
  options?: SerializeOptions,
): ErrorHttpResponse {
  const rich = toRichError(error);
  const body = serializeRichError(rich, options);
  return { body, statusCode: status ?? KIND_TO_STATUS[rich.kind] ?? 500 };
}
