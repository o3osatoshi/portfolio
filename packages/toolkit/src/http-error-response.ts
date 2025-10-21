import type { Kind } from "./error";
import type { SerializeOptions } from "./error-serializer";
import { type SerializedError, serializeError } from "./error-serializer";

export type ErrorHttpResponse = {
  body: SerializedError;
  status: number;
};

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
 * Build an HTTP-friendly error response from an Error.
 *
 * - Body is created via `serializeError` for safe cross-boundary transport.
 * - Status is inferred from the error `name` (Kind) unless explicitly provided.
 *
 * @param error - Error instance to convert.
 * @param status - Optional HTTP status override.
 * @param options - Optional serialization options (depth, stack inclusion, truncation).
 */
export function toHttpErrorResponse(
  error: Error,
  status?: number,
  options?: SerializeOptions,
): ErrorHttpResponse {
  const body = serializeError(error, options);
  return { body, status: status ?? deriveStatusFromError(error) };
}

function deriveStatusFromError(e: Error): number {
  const kind = detectKindFromName(e.name);
  if (kind) return KIND_TO_STATUS[kind];
  return 500;
}

function detectKindFromName(name: string): Kind | undefined {
  // Names produced by newError follow: `${Layer}${Kind}Error`
  for (const kind of Object.keys(KIND_TO_STATUS) as Kind[]) {
    if (name.endsWith(`${kind}Error`)) return kind;
  }
  // Common external error names
  if (name === "ZodError") return "Validation";
  if (name === "AbortError") return "Canceled";
  return undefined;
}
