/**
 * Serialized body for an HTTP error response.
 */
export type ErrorBody = {
  code: ErrorCode;
  message: string;
};

/**
 * Enumerates the error codes exposed by the HTTP layer.
 */
export type ErrorCode =
  | "FORBIDDEN"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR";

/**
 * Structured HTTP error response.
 */
export type HttpError = { body: ErrorBody; status: number };

/**
 * Domain-level error types and their mapping to HTTP responses.
 */
export type KnownError =
  | ForbiddenError
  | NotFoundError
  | UnauthorizedError
  | ValidationError;

/**
 * Error thrown when an action is not allowed for the current principal.
 * Maps to HTTP 403 (FORBIDDEN) via {@link toHttpError}.
 */
export class ForbiddenError extends Error {
  readonly kind = "Forbidden" as const;
  constructor(message = "Forbidden") {
    super(message);
  }
}

/**
 * Error thrown when a requested resource cannot be found.
 * Maps to HTTP 404 (NOT_FOUND) via {@link toHttpError}.
 */
export class NotFoundError extends Error {
  readonly kind = "NotFound" as const;
  constructor(message = "Not found") {
    super(message);
  }
}

/**
 * Error thrown when authentication is required or has failed.
 * Maps to HTTP 401 (UNAUTHORIZED) via {@link toHttpError}.
 */
export class UnauthorizedError extends Error {
  readonly kind = "Unauthorized" as const;
  constructor(message = "Unauthorized") {
    super(message);
  }
}

/**
 * Error thrown when input validation fails.
 * Maps to HTTP 400 (BAD_REQUEST) via {@link toHttpError}.
 */
export class ValidationError extends Error {
  readonly kind = "ValidationError" as const;
  constructor(message = "Validation error") {
    super(message);
  }
}

/**
 * Convert an unknown error into an HTTP-friendly shape.
 *
 * Known domain errors are mapped to specific status codes and response bodies.
 * Unknown errors fall back to 500 with a generic message unless the input
 * is an `Error`, in which case its message is preserved.
 *
 * @param err The error to convert.
 * @returns An object containing the serialized `body` and HTTP `status`.
 */
export function toHttpError(err: unknown): HttpError {
  if (err instanceof ValidationError) {
    return {
      body: { code: "VALIDATION_ERROR", message: err.message },
      status: 400,
    };
  }
  if (err instanceof UnauthorizedError) {
    return {
      body: { code: "UNAUTHORIZED", message: err.message },
      status: 401,
    };
  }
  if (err instanceof ForbiddenError) {
    return { body: { code: "FORBIDDEN", message: err.message }, status: 403 };
  }
  if (err instanceof NotFoundError) {
    return { body: { code: "NOT_FOUND", message: err.message }, status: 404 };
  }
  return {
    body: {
      code: "INTERNAL_SERVER_ERROR",
      message: err instanceof Error ? err.message : "Internal Server Error",
    },
    status: 500,
  };
}
