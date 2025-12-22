import { type LogAttributes, SeverityNumber } from "@opentelemetry/api-logs";

import type { Attributes, Severity } from "./types";

/**
 * Convert span {@link Attributes} to log record attributes.
 *
 * @internal
 */
export function toLogAttributes(
  attributes?: Attributes,
): LogAttributes | undefined {
  if (!attributes) return undefined;

  const logAttributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined) continue;
    logAttributes[key] = value;
  }

  if (Object.keys(logAttributes).length === 0) return undefined;

  return logAttributes as LogAttributes;
}

/**
 * Convert a string severity label to the OpenTelemetry logs severity fields.
 *
 * @internal
 */
export function toLogRecordSeverity(severity: Severity): {
  severityNumber: SeverityNumber;
  severityText: string;
} {
  switch (severity) {
    case "debug":
      return {
        severityNumber: SeverityNumber.DEBUG,
        severityText: "DEBUG",
      };
    case "info":
      return {
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
      };
    case "warn":
      return {
        severityNumber: SeverityNumber.WARN,
        severityText: "WARN",
      };
    case "error":
      return {
        severityNumber: SeverityNumber.ERROR,
        severityText: "ERROR",
      };
    default:
      return {
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
      };
  }
}
