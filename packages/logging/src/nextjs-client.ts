/**
 * @packageDocumentation
 * Next.js client helpers powered by the official Axiom integrations.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/nextjs/client` inside client components.
 */
"use client";

import { Logger as AxiomLogger } from "@axiomhq/logging";
import { nextJsFormatters } from "@axiomhq/nextjs/client";
import {
  createUseLogger,
  createWebVitalsComponent,
  transformWebVitalsMetric,
  useReportWebVitals,
} from "@axiomhq/react";

import {
  createBridgeTransport,
  type NextjsLoggerOptions,
} from "./nextjs-shared";
import type { Logger } from "./types";

/**
 * Create an Axiom logger that forwards events to {@link Logger}.
 *
 * @remarks
 * Defaults to the client-side Next.js formatters.
 * Pass a browser logger created via `initBrowserLogger` /
 * `createBrowserLogger`.
 *
 * @public
 */
export function createNextjsLogger(options: NextjsLoggerOptions): AxiomLogger {
  const transport = createBridgeTransport(options.logger);
  const formatters = options.formatters ?? nextJsFormatters;

  return new AxiomLogger({
    formatters,
    transports: [transport],
    ...(options.logLevel ? { logLevel: options.logLevel } : {}),
    ...(options.args ? { args: options.args } : {}),
    ...(options.overrideDefaultFormatters !== undefined
      ? { overrideDefaultFormatters: options.overrideDefaultFormatters }
      : {}),
  });
}

/**
 * Create a hook that returns a logger bridged to {@link Logger}.
 *
 * @remarks
 * The hook returns the bridged `@axiomhq/logging` logger instance.
 * Requires a client-side logger created via `initBrowserLogger`.
 *
 * @public
 */
export function createNextjsUseLogger(
  logger: Logger,
  options?: Omit<NextjsLoggerOptions, "logger">,
): ReturnType<typeof createUseLogger> {
  const bridgeLogger = createNextjsLogger({
    logger,
    ...options,
  });

  return createUseLogger(bridgeLogger);
}

/**
 * Create a Web Vitals component that forwards metrics into {@link Logger}.
 *
 * @remarks
 * Requires a client-side logger created via `initBrowserLogger`.
 *
 * @public
 */
export function createNextjsWebVitalsComponent(
  logger: Logger,
  options?: Omit<NextjsLoggerOptions, "logger">,
): ReturnType<typeof createWebVitalsComponent> {
  const bridgeLogger = createNextjsLogger({
    logger,
    ...options,
  });

  return createWebVitalsComponent(bridgeLogger);
}

export { nextJsFormatters };

export {
  createUseLogger,
  createWebVitalsComponent,
  transformWebVitalsMetric,
  useReportWebVitals,
};

export type { NextjsLoggerOptions };
