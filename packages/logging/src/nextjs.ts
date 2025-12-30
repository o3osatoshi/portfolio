/**
 * @packageDocumentation
 * Next.js server helpers powered by the official Axiom integrations.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/nextjs` in server-only code (route handlers,
 * middleware, instrumentation) while continuing to emit events through
 * {@link Logger}. Client helpers live in
 * `@o3osatoshi/logging/nextjs/client`.
 */

import { Logger as AxiomLogger, EVENT } from "@axiomhq/logging";
import {
  createAxiomRouteHandler as axiomCreateAxiomRouteHandler,
  createOnRequestError as axiomCreateOnRequestError,
  createProxyRouteHandler as axiomCreateProxyRouteHandler,
  frameworkIdentifier,
  frameworkIdentifierFormatter,
  getLogLevelFromStatusCode,
  getNextErrorStatusCode,
  nextJsFormatters as nextJsServerFormatters,
  runWithServerContext,
  serverContextFieldsFormatter,
  transformMiddlewareRequest,
  transformOnRequestError,
  transformRouteHandlerErrorResult,
  transformRouteHandlerSuccessResult,
} from "@axiomhq/nextjs";

import { createBridgeTransport, type LoggerOptions } from "./nextjs-shared";
import type { Attributes, Logger } from "./types";

/**
 * Configuration for Next.js route handler helpers.
 *
 * @public
 */
export interface NextjsRouteHandlerOptions {
  /**
   * Optional route handler configuration forwarded to Axiom helpers.
   *
   * @remarks
   * Passed directly to {@link axiomCreateAxiomRouteHandler}.
   */
  handler?: Parameters<typeof axiomCreateAxiomRouteHandler>[1];
  /**
   * Optional bridge logger configuration.
   */
  loggerOptions?: Omit<LoggerOptions, "logger">;
}

/**
 * Create an Axiom logger that forwards events to {@link Logger}.
 *
 * @remarks
 * This logger is intended for Next.js helpers that require
 * `@axiomhq/logging` instances. Events are converted into attributes and
 * emitted through the provided {@link Logger}.
 * Defaults to the server-side Next.js formatters.
 *
 * @public
 */
export function createLogger(options: LoggerOptions): AxiomLogger {
  const transport = createBridgeTransport(options.logger);
  const formatters = options.formatters ?? nextJsServerFormatters;

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
 * Create a Next.js `onRequestError` handler that logs via {@link Logger}.
 *
 * @remarks
 * Uses the server-side Next.js formatters by default.
 *
 * @public
 */
export function createOnRequestError(
  logger: Logger,
  options?: Omit<LoggerOptions, "logger">,
): ReturnType<typeof axiomCreateOnRequestError> {
  const bridgeLogger = createLogger({
    logger,
    ...options,
  });

  return axiomCreateOnRequestError(bridgeLogger);
}

/**
 * Create a Next.js proxy route handler that forwards client logs.
 *
 * @remarks
 * Intended for `/api/axiom` proxy routes.
 *
 * @public
 */
export function createProxyRouteHandler(
  logger: Logger,
  options?: Omit<LoggerOptions, "logger">,
): ReturnType<typeof axiomCreateProxyRouteHandler> {
  const bridgeLogger = createLogger({
    logger,
    ...options,
  });

  return axiomCreateProxyRouteHandler(bridgeLogger);
}

/**
 * Create a Next.js route handler wrapper powered by the Axiom integration.
 *
 * @remarks
 * Uses the server-side Next.js formatters by default.
 *
 * @public
 */
export function createRouteHandler(
  logger: Logger,
  options: NextjsRouteHandlerOptions = {},
): ReturnType<typeof axiomCreateAxiomRouteHandler> {
  const bridgeLogger = createLogger({
    logger,
    ...(options.loggerOptions ?? {}),
  });

  return axiomCreateAxiomRouteHandler(bridgeLogger, options.handler);
}

/**
 * Log a Next.js middleware request via {@link Logger}.
 *
 * @param attributes - Additional attributes that override defaults.
 *
 * @public
 */
export function logMiddlewareRequest(
  logger: Logger,
  request: Parameters<typeof transformMiddlewareRequest>[0],
  attributes?: Attributes,
): void {
  const [message, report] = transformMiddlewareRequest(request);
  const eventFields = (report as Record<string | symbol, unknown>)[EVENT];
  const merged: Attributes = {
    ...(report as Attributes),
  };

  if (eventFields && typeof eventFields === "object") {
    for (const [key, value] of Object.entries(
      eventFields as Record<string, unknown>,
    )) {
      merged[key] = value as Attributes[string];
    }
  }

  logger.info(message, {
    ...merged,
    ...(attributes ?? {}),
  });
}

export {
  EVENT,
  frameworkIdentifier,
  frameworkIdentifierFormatter,
  getLogLevelFromStatusCode,
  getNextErrorStatusCode,
  nextJsServerFormatters as nextJsFormatters,
  runWithServerContext,
  serverContextFieldsFormatter,
  transformMiddlewareRequest,
  transformOnRequestError,
  transformRouteHandlerErrorResult,
  transformRouteHandlerSuccessResult,
};
export type { LoggerOptions };
