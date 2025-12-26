import type { Logger } from "../types";

/**
 * Create a logger that performs no operations.
 *
 * @internal
 */
export function createNoopLogger(): Logger {
  const noop = () => {};
  const flush = async () => {};

  return {
    child: () => createNoopLogger(),
    debug: noop,
    error: noop,
    event: noop,
    flush,
    info: noop,
    metric: noop,
    warn: noop,
  };
}
