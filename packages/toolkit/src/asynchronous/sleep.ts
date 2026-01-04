import { ResultAsync } from "neverthrow";

import { deserializeError, newError } from "../error";

/**
 * Options accepted by {@link sleep}.
 *
 * @public
 */
export type SleepOptions = {
  /**
   * Optional signal used to cancel the pending timeout before it resolves.
   * Pass `AbortController.signal` to interrupt the sleep and receive an
   * `InfraCanceledError`.
   */
  signal?: AbortSignal;
};

/**
 * Delay execution for a given duration with AbortSignal support.
 *
 * Designed as an infrastructure utility that keeps timing logic near the runtime.
 * Rejects with an `InfraCanceledError` when the provided signal aborts before the
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
): ResultAsync<void, Error> {
  const mapErr = (error: unknown): Error =>
    deserializeError(error, {
      fallback: (cause) =>
        newError({
          action: "Sleep",
          cause,
          kind: "Unknown",
          layer: "Infra",
          reason: "sleep rejected with non-error value",
        }),
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
        return newError({
          action: "Sleep",
          cause: signal.reason,
          kind: "Canceled",
          layer: "Infra",
          reason: "operation aborted by AbortSignal",
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
