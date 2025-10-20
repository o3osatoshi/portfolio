export interface SerializedError {
  cause?: string | undefined;
  message: string;
  name: string;
  stack?: string | undefined;
}

/**
 * SerializedError → Error
 */
export function deserializeError(serializedError: SerializedError): Error {
  const error = new Error(serializedError.message);
  error.name = serializedError.name;
  if (serializedError.stack) error.stack = serializedError.stack;
  if (serializedError.cause) error.cause = serializedError.cause;
  return error;
}

/**
 * Error → SerializedError
 */
export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      cause:
        typeof error.cause === "string"
          ? error.cause
          : error.cause instanceof Error
            ? error.cause.message
            : undefined,
      message: error.message,
      stack:
        process.env["NODE_ENV"] === "development" ? error.stack : undefined,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}
