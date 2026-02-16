/**
 * Internal constructor shape for `Error` implementations that support
 * `{ cause }` in the constructor options.
 */
export type ErrorConstructor = new (
  message?: string,
  options?: { cause?: unknown },
) => Error;
