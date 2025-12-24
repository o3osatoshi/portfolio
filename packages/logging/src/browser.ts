/**
 * @packageDocumentation
 * Browser logging helpers for sending structured logs and metrics to Axiom.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/browser`.
 */

import { createAxiomTransport } from "./core/axiom";
import { createLogger } from "./core/logger";
import { createNoopLogger } from "./core/noop";
import type {
  Attributes,
  Logger,
  RuntimeLoggingOptions,
  Transport,
} from "./types";

type BrowserState = {
  attributes: Attributes;
  logger: Logger;
  options: RuntimeLoggingOptions;
  transport: Transport;
};

let browserState: BrowserState | undefined;
let flushRegistered = false;

/**
 * Return the browser logger initialized by {@link initBrowserLogger}.
 *
 * @remarks
 * Returns a no-op logger until initialization completes.
 *
 * @public
 */
export function createBrowserLogger(): Logger {
  if (!browserState) {
    return createNoopLogger();
  }
  return browserState.logger;
}

/**
 * Initialize the browser logger with Axiom transport.
 *
 * @remarks
 * This function is idempotent; subsequent calls are ignored.
 * When `flushOnEnd` is not `false`, the logger flushes on pagehide/visibility.
 *
 * @public
 */
export function initBrowserLogger(options: RuntimeLoggingOptions): void {
  if (browserState) return;

  const { onError: clientOnError, ...clientOptions } = options.client;
  const onError = options.onError ?? clientOnError;
  const transport = createAxiomTransport({
    ...clientOptions,
    mode: "immediate",
    ...(onError ? { onError } : {}),
  });

  const attributes: Attributes = {
    "service.name": options.service,
    "deployment.environment": options.env,
  };

  const logger = createLogger({
    attributes,
    datasets: options.datasets,
    transport,
    ...(options.minLevel !== undefined ? { minLevel: options.minLevel } : {}),
    ...(options.sampleRate !== undefined
      ? { sampleRate: options.sampleRate }
      : {}),
  });

  browserState = {
    attributes,
    logger,
    options,
    transport,
  };

  if (options.flushOnEnd ?? true) {
    registerBrowserFlush();
  }
}

/**
 * Flush buffered logs and reset the browser logger state.
 *
 * @public
 */
export async function shutdownBrowserLogger(): Promise<void> {
  if (!browserState) return;
  await browserState.transport.flush?.();
  browserState = undefined;
}

function registerBrowserFlush(): void {
  if (flushRegistered) return;
  flushRegistered = true;

  const gt = globalThis as {
    addEventListener?: (type: string, listener: () => void) => void;
    document?: {
      addEventListener?: (type: string, listener: () => void) => void;
      visibilityState?: string;
    };
  };

  if (!gt.addEventListener) return;

  const flush = () => {
    void browserState?.transport.flush?.();
  };

  gt.addEventListener("pagehide", flush);
  gt.document?.addEventListener?.("visibilitychange", () => {
    if (gt.document?.visibilityState === "hidden") {
      flush();
    }
  });
}
