/**
 * @packageDocumentation
 * Next.js client helpers powered by the official Axiom integrations.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/nextjs/client` inside client components.
 */

import { Logger as AxiomLogger } from "@axiomhq/logging";
import { nextJsFormatters } from "@axiomhq/nextjs/client";
import {
  createUseLogger as AxiomCreateUseLogger,
  createWebVitalsComponent as AxiomCreateWebVitalsComponent,
  transformWebVitalsMetric,
  useReportWebVitals,
} from "@axiomhq/react";

import { createBridgeTransport, type LoggerOptions } from "./nextjs-shared";
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
export function createLogger(options: LoggerOptions): AxiomLogger {
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
export function createUseLogger(
  logger: Logger,
  options?: Omit<LoggerOptions, "logger">,
): ReturnType<typeof AxiomCreateUseLogger> {
  const bridgeLogger = createLogger({
    logger,
    ...options,
  });

  return AxiomCreateUseLogger(bridgeLogger);
}

/**
 * Create a Web Vitals component that forwards metrics into {@link Logger}.
 *
 * @remarks
 * Requires a client-side logger created via `initBrowserLogger`.
 *
 * @public
 */
export function createWebVitalsComponent(
  logger: Logger,
  options?: Omit<LoggerOptions, "logger">,
): ReturnType<typeof AxiomCreateWebVitalsComponent> {
  const bridgeLogger = createLogger({
    logger,
    ...options,
  });

  return AxiomCreateWebVitalsComponent(bridgeLogger);
}

export { nextJsFormatters };

export { transformWebVitalsMetric, useReportWebVitals };

export type { LoggerOptions };
