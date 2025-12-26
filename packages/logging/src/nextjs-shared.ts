import {
  type LogEvent as AxiomLogEvent,
  EVENT,
  type Formatter,
  type LoggerConfig,
  type LogLevel,
} from "@axiomhq/logging";

import type { Attributes, Logger } from "./types";

/**
 * Configuration for creating a bridge logger that feeds Next.js helpers into
 * {@link Logger}.
 *
 * @remarks
 * The default formatters depend on the entrypoint (server vs client).
 *
 * @public
 */
export interface NextjsLoggerOptions {
  /**
   * Optional logger args to be applied to every event.
   */
  args?: LoggerConfig["args"];
  /**
   * Optional formatter list for the Axiom logger.
   *
   * @remarks
   * Defaults to the Next.js formatters for the active entrypoint.
   */
  formatters?: Formatter[];
  /**
   * Base logger that receives Next.js log events.
   */
  logger: Logger;
  /**
   * Optional log level for the bridge logger.
   */
  logLevel?: LogLevel;
  /**
   * Optional flag to replace the default Axiom formatters.
   */
  overrideDefaultFormatters?: LoggerConfig["overrideDefaultFormatters"];
}

/**
 * Create a transport that forwards Axiom log events into the provided logger.
 *
 * @internal
 */
export function createBridgeTransport(
  logger: Logger,
): LoggerConfig["transports"][0] {
  return {
    flush: () => logger.flush(),
    log: (logs) => {
      for (const logEvent of logs) {
        forwardLogEvent(logger, logEvent as AxiomLogEvent);
      }
    },
  };
}

/**
 * Forward a single Axiom log event into the provided logger.
 *
 * @internal
 */
export function forwardLogEvent(logger: Logger, event: AxiomLogEvent): void {
  const record = event as Record<string, unknown>;
  const message = event.message ?? "nextjs_log";
  const fieldsValue = record["fields"];
  const fields =
    fieldsValue && typeof fieldsValue === "object" ? fieldsValue : {};
  const level = event.level ?? "info";
  const app = record["@app"];
  const source = record["source"];
  const time = record["_time"];

  const attributes: Attributes = {
    ...(fields as Attributes),
  };

  for (const [key, value] of Object.entries(record)) {
    if (key === "fields" || key === "message" || key === "level") continue;
    if (key === "_time" || key === "source" || key === "@app") continue;
    attributes[key] = value as Attributes[string];
  }

  const eventFields = (record as Record<string | symbol, unknown>)[EVENT];
  if (eventFields && typeof eventFields === "object") {
    for (const [key, value] of Object.entries(
      eventFields as Record<string, unknown>,
    )) {
      attributes[key] = value as Attributes[string];
    }
  }

  if (typeof source === "string") {
    attributes["axiom.source"] = source;
  }
  if (typeof time === "number" || typeof time === "string") {
    attributes["axiom.time"] = time;
  }
  if (typeof app === "string") {
    attributes["axiom.app"] = app;
  }

  if (level === "off") {
    return;
  }
  if (level === "error") {
    logger.error(message, attributes);
    return;
  }
  if (level === "warn") {
    logger.warn(message, attributes);
    return;
  }
  if (level === "debug") {
    logger.debug(message, attributes);
    return;
  }

  logger.info(message, attributes);
}
