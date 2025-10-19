import { newError } from "./error";

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
 * @returns Promise that resolves after `ms` milliseconds or rejects if aborted.
 * @public
 */
export function sleep(
  ms: number,
  { signal }: SleepOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);

    if (!signal) {
      return;
    }

    const abortError = () =>
      newError({
        action: "Sleep",
        cause: signal.reason,
        kind: "Canceled",
        layer: "Infra",
        reason: "operation aborted by AbortSignal",
      });

    if (signal.aborted) {
      clearTimeout(timeout);
      reject(abortError());
      return;
    }

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(abortError());
      },
      { once: true },
    );
  });
}
