/**
 * HTTP response helpers for converting server-side Errors into
 * frontend‑friendly payloads.
 *
 * The main export is {@link toHttpErrorResponse}, which:
 * - Serializes the provided `Error` into a stable, JSON‑safe structure using
 *   {@link serializeError}, suitable for logs, workers, or API responses.
 * - Infers the most appropriate HTTP status code from the error `name` when no
 *   explicit status is provided. Errors produced via {@link newError} use the
 *   convention `"${Layer}${Kind}Error"`, and the `Kind` maps to an HTTP
 *   status as described below.
 *
 * Status mapping (Kind → HTTP status):
 * - `Validation` → 400
 * - `Unauthorized` → 401
 * - `Forbidden` → 403
 * - `NotFound` → 404
 * - `Conflict` / `Integrity` / `Deadlock` → 409
 * - `RateLimit` → 429
 * - `Timeout` → 504
 * - `Unavailable` → 503
 * - `Canceled` → 499 (非標準だが、プロキシ環境で一般的。必要に応じて上書き可能)
 * - `Serialization` / `Config` / `Unknown` → 500
 *
 * 追加のヒューリスティクス:
 * - `ZodError` は 400（Validation）として扱います。
 * - `AbortError` は 499（Canceled）として扱います。
 *
 * セキュリティ: 既定では `serializeError` は development でのみ stack を含めます。
 * 本番で stack を含めたい／除外したい場合は `options.includeStack` を明示してください。
 *
 * @module http-error-response
 */
import type { Kind } from "./error";
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
  Canceled: 499, // Client Closed Request (non-standard, widely used)
  Config: 500,
  Conflict: 409,
  Deadlock: 409,
  Integrity: 409,
  NotFound: 404,
  RateLimit: 429,
  Serialization: 500,
  Timeout: 504,
  Unauthorized: 401,
  Unavailable: 503,
  Unknown: 500,
};

/**
 * Convert an `Error` into an HTTP‑friendly `{ body, status }` pair.
 *
 * - `body` は {@link serializeError} により安定した JSON 形式に変換されます。
 * - `status` は第2引数で明示が無い場合、`error.name` から推定します。
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
 * - `newError` による名前付け（`"${Layer}${Kind}Error"`）を優先して判定します。
 * - 外部エラーとして `ZodError` と `AbortError` を特別扱いします。
 */
function detectKindFromName(name: string): Kind | undefined {
  for (const kind of Object.keys(KIND_TO_STATUS) as Kind[]) {
    if (name.endsWith(`${kind}Error`)) return kind;
  }
  if (name === "ZodError") return "Validation";
  if (name === "AbortError") return "Canceled";
  return undefined;
}
