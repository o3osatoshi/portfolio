import type { ResultAsync } from "neverthrow";

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
 * @public
 */
export async function unwrapResultAsyncOrThrow<T, E extends Error>(
  result: ResultAsync<T, E>,
): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
}
