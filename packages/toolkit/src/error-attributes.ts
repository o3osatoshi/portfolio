import { truncate } from "./truncate";

/**
 * Extracts a concise error message string from an unknown cause when possible.
 *
 * The function prefers `Error` instances but gracefully handles plain strings and
 * objects that expose a `message` field. Returned strings are truncated to avoid
 * leaking unbounded payloads in logs or telemetry.
 *
 * @param cause - Value supplied as an error `cause`.
 * @returns A trimmed and truncated message when detectable, otherwise `undefined`.
 */
export function extractErrorMessage(cause: unknown): string | undefined {
  if (!cause) return;
  if (cause instanceof Error) return truncate(cause.message);
  if (typeof cause === "string") return truncate(cause);
  if (typeof cause === "object" && "message" in cause) {
    const message = cause.message;
    return typeof message === "string" ? truncate(message) : undefined;
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
