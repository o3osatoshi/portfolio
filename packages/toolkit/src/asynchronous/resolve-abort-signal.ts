/**
 * Options for {@link resolveAbortSignal}.
 *
 * @public
 */
export type ResolveAbortSignalOptions = {
  /**
   * Optional upstream abort signal to follow.
   */
  signal?: AbortSignal | undefined;
  /**
   * Optional timeout budget in milliseconds.
   */
  timeoutMs?: number | undefined;
  /**
   * Optional abort reason used when the timeout elapses.
   * When omitted, a generic timeout error is used.
   */
  timeoutReason?: undefined | unknown;
};

/**
 * Result produced by {@link resolveAbortSignal}.
 *
 * @public
 */
export type ResolvedAbortSignal = {
  /**
   * Cleanup function to clear timeouts and listeners.
   */
  cleanup: () => void;
  /**
   * Derived signal that can be passed to async operations.
   */
  signal?: AbortSignal | undefined;
};

/**
 * Combine an optional upstream signal with an optional timeout budget.
 *
 * When `timeoutMs` is provided, a new `AbortController` is created and aborted
 * on timeout. When `signal` is provided, the returned signal will follow it.
 *
 * @param options - Abort signal configuration.
 * @returns Derived signal with a cleanup hook.
 * @public
 */
export function resolveAbortSignal(
  options: ResolveAbortSignalOptions = {},
): ResolvedAbortSignal {
  const { signal, timeoutMs, timeoutReason } = options;

  if (!timeoutMs) {
    return { cleanup: () => {}, signal };
  }

  const controller = new AbortController();
  const onAbort = () => {
    controller.abort(signal?.reason);
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return { cleanup: () => {}, signal: controller.signal };
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }

  const reason =
    timeoutReason === undefined
      ? new Error("Operation timed out")
      : timeoutReason;

  const timeoutId = setTimeout(() => {
    controller.abort(reason);
  }, timeoutMs);

  const cleanup = () => {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", onAbort);
    }
  };

  return { cleanup, signal: controller.signal };
}
