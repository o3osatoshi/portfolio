import { truncate } from "./truncate";

/**
 * Extracts a concise error message string from an unknown cause when possible.
 *
 * The function prefers `Error` instances but gracefully handles plain strings and
 * objects that expose a `message` field. When `maxLen` is provided, the
 * returned string is truncated to avoid leaking unbounded payloads. If omitted,
 * no truncation is applied by default.
 *
 * @public
 * @param cause - Value supplied as an error `cause`.
 * @param maxLen - Optional maximum length for truncation. When omitted, no truncation.
 * @returns A trimmed and truncated message when detectable, otherwise `undefined`.
 */
export function extractErrorMessage(
  cause: unknown,
  maxLen?: number,
): string | undefined {
  if (!cause) return;
  const len = maxLen ?? null;
  if (cause instanceof Error) return truncate(cause.message, len);
  if (typeof cause === "string") return truncate(cause, len);
  if (typeof cause === "object" && "message" in cause) {
    const message = cause["message"];
    return typeof message === "string" ? truncate(message, len) : undefined;
  }
  return undefined;
}

/**
 * Extracts an error name from an unknown cause when possible.
 *
 * This helper mirrors `extractErrorMessage` but targets the `name` field. It is useful for
 * detecting coarse error categories (e.g. `AbortError`) even when the error instance is wrapped
 * or proxied.
 *
 * @public
 * @param cause - Value supplied as an error `cause`.
 * @returns Detected error name or `undefined` when the value lacks an appropriate field.
 */
export function extractErrorName(cause: unknown): string | undefined {
  if (!cause) return;
  if (cause instanceof Error) return cause.name;
  if (typeof cause === "object" && "name" in cause) {
    const name = cause.name;
    return typeof name === "string" ? name : undefined;
  }
  return undefined;
}
