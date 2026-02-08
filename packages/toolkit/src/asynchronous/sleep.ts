import { ResultAsync } from "neverthrow";

import { newRichError, type RichError, toRichError } from "../error";

/**
 * Options accepted by {@link sleep}.
 *
 * @public
 */
export type SleepOptions = {
  /**
   * Optional signal used to cancel the pending timeout before it resolves.
   * Pass `AbortController.signal` to interrupt the sleep and receive an
   * `InfrastructureCanceledError`.
   */
  signal?: AbortSignal;
};

/**
 * Delay execution for a given duration with AbortSignal support.
 *
 * Designed as an infrastructure utility that keeps timing logic near the runtime.
 * Rejects with an `InfrastructureCanceledError` when the provided signal aborts before the
 * timeout completes.
 *
 * @param ms - Milliseconds to wait before resolving.
 * @param options - Optional abort configuration; pass `AbortController.signal`.
 * @returns ResultAsync that resolves after `ms` milliseconds or yields an error
 *          when aborted.
 * @public
 */
export function sleep(
  ms: number,
  { signal }: SleepOptions = {},
): ResultAsync<void, RichError> {
  const mapErr = (error: unknown): RichError =>
    toRichError(error, {
      details: {
        action: "Sleep",
        reason: "sleep rejected with an unexpected error value",
      },
      kind: "Internal",
      layer: "Infrastructure",
    });

  if (!signal) {
    return ResultAsync.fromPromise(
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      }),
      mapErr,
    );
  }

  return ResultAsync.fromPromise(
    new Promise<void>((resolve, reject) => {
      const newCanceledError = () => {
        return newRichError({
          cause: signal.reason,
          code: "SLEEP_ABORTED",
          details: {
            action: "Sleep",
            reason: "operation aborted by AbortSignal",
          },
          kind: "Canceled",
          layer: "Infrastructure",
        });
      };

      if (signal.aborted) {
        return reject(newCanceledError());
      }

      const timeout = setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, ms);

      const onAbort = () => {
        clearTimeout(timeout);
        reject(newCanceledError());
      };

      signal.addEventListener("abort", onAbort, { once: true });
    }),
    mapErr,
  );
}
