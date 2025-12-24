import { type JsonValue, serializeError } from "@o3osatoshi/toolkit";

import type {
  Attributes,
  LogEvent,
  Logger,
  LoggingDatasets,
  LogLevel,
  MetricOptions,
  Transport,
} from "../types";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  error: 40,
  info: 20,
  warn: 30,
};

/**
 * Options used to create a logger instance.
 *
 * @public
 */
export interface CreateLoggerOptions {
  /**
   * Base attributes applied to every event.
   *
   * @defaultValue An empty object
   *
   * @remarks
   * Per-call attributes override these base values.
   */
  attributes?: Attributes;
  /**
   * Target datasets for logs and metrics.
   */
  datasets: LoggingDatasets;
  /**
   * Optional minimum log level.
   *
   * @defaultValue undefined (all levels are emitted)
   */
  minLevel?: LogLevel;
  /**
   * Optional sampling rate (0..1) applied to logs/events.
   *
   * @defaultValue undefined (no sampling)
   */
  sampleRate?: number;
  /**
   * Transport responsible for emitting events.
   */
  transport: Transport;
}

/**
 * Create a structured logger.
 *
 * @remarks
 * - Log and event entries are emitted to `datasets.logs`.
 * - Metric events are emitted to `datasets.metrics`.
 * - Error objects are serialized into `exception.*` fields.
 *
 * @public
 */
export function createLogger(options: CreateLoggerOptions): Logger {
  const baseAttributes = options.attributes ?? {};
  const minLevel = options.minLevel;
  const transport = options.transport;
  const datasets = options.datasets;

  const shouldSample = () => {
    const sampleRate = options.sampleRate;
    if (sampleRate === undefined) return true;
    if (sampleRate >= 1) return true;
    if (sampleRate <= 0) return false;
    return Math.random() <= sampleRate;
  };

  const shouldLog = (level: LogLevel) => {
    if (!shouldSample()) return false;
    if (!minLevel) return true;
    return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[minLevel];
  };

  const buildEvent = (attributes: Attributes): LogEvent => {
    return {
      ...normalizeAttributes(baseAttributes),
      ...normalizeAttributes(attributes),
      timestamp: new Date().toISOString(),
    };
  };

  const emit = (dataset: string, event: LogEvent) => {
    transport.emit(dataset, event);
  };

  const log = (
    level: LogLevel,
    message: string,
    attributes?: Attributes,
    error?: unknown,
  ) => {
    if (!shouldLog(level)) return;

    const errorAttributes = error ? toErrorAttributes(error) : undefined;

    const logEvent = buildEvent({
      ...(attributes ?? {}),
      ...(errorAttributes ?? {}),
      "event.name": message,
      "event.type": "log",
      level,
      message,
    });

    emit(datasets.logs, logEvent);
  };

  const event = (name: string, attributes?: Attributes) => {
    if (!shouldLog("info")) return;

    const logEvent = buildEvent({
      ...(attributes ?? {}),
      "event.name": name,
      "event.type": "event",
      level: "info",
      message: name,
    });

    emit(datasets.logs, logEvent);
  };

  const metric = (
    name: string,
    value: number,
    attributes?: Attributes,
    options?: MetricOptions,
  ) => {
    if (!shouldSample()) return;

    const logEvent = buildEvent({
      ...(attributes ?? {}),
      "event.name": name,
      "metric.name": name,
      "event.type": "metric",
      level: "info",
      message: name,
      "metric.kind": options?.kind,
      "metric.unit": options?.unit,
      "metric.value": value,
    });

    emit(datasets.metrics, logEvent);
  };

  const flush = async () => {
    if (transport.flush) {
      await transport.flush();
    }
  };

  const child = (attributes: Attributes): Logger => {
    return createLogger({
      ...options,
      attributes: {
        ...baseAttributes,
        ...attributes,
      },
    });
  };

  return {
    child,
    debug: (msg, attrs) => log("debug", msg, attrs),
    error: (msg, attrs, err) => log("error", msg, attrs, err),
    event,
    flush,
    info: (msg, attrs) => log("info", msg, attrs),
    metric,
    warn: (msg, attrs) => log("warn", msg, attrs),
  };
}

function normalizeAttributes(attributes: Attributes): Attributes {
  const nAttributes: Attributes = {};
  for (const [key, rawValue] of Object.entries(attributes)) {
    const nValue = normalizeValue(rawValue);
    if (nValue === undefined) continue;
    nAttributes[key] = nValue;
  }
  return nAttributes;
}

function normalizeValue(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value
      .map((rawValue) => normalizeValue(rawValue))
      .filter((rawValue): rawValue is JsonValue => rawValue !== undefined);
  }

  if (typeof value === "object") {
    const nAttributes: Record<string, JsonValue> = {};
    for (const [key, rawValue] of Object.entries(value)) {
      const nValue = normalizeValue(rawValue);
      if (nValue === undefined) continue;
      nAttributes[key] = nValue;
    }
    return nAttributes;
  }

  return String(value);
}

function toErrorAttributes(error: unknown): Attributes {
  const serializedError = serializeError(
    error instanceof Error ? error : new Error(String(error)),
    {
      includeStack:
        typeof process !== "undefined" &&
        process.env?.["NODE_ENV"] === "development",
    },
  );

  return {
    "exception.cause": normalizeValue(serializedError.cause),
    "exception.message": serializedError.message,
    "exception.stacktrace": serializedError.stack,
    "exception.type": serializedError.name,
  };
}
