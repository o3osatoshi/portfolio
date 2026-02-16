import type { ResultAsync } from "neverthrow";

import type { RichError } from "./error";

/**
 * Unwrap a ResultAsync into a Promise that throws on Err.
 *
 * @remarks
 * This helper is intentionally discouraged. It bypasses the ResultAsync flow and
 * reintroduces thrown exceptions, which makes error handling less explicit and
 * can leak failures across boundaries. Prefer `match`, `mapErr`, or returning
 * `ResultAsync` whenever possible. Use only at integration boundaries that
 * require a Promise that rejects (for example, scheduler step runners).
 *
 * @typeParam T - Successful value type inside `ResultAsync`.
 * @typeParam E - Error type extending {@link RichError}. Defaults to `RichError`.
 * @param result - ResultAsync value to unwrap.
 * @returns A Promise that resolves with the Ok value or rejects with the Err error.
 *
 * @public
 */
export async function unwrapResultAsync<T, E extends RichError = RichError>(
  result: ResultAsync<T, E>,
): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
}
