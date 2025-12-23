import { serializeError } from "@o3osatoshi/toolkit";

import type {
  Attributes,
  JsonValue,
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
   */
  base?: Attributes;
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
  const base = options.base ?? {};
  const minLevel = options.minLevel;
  const sampleRate = options.sampleRate;
  const transport = options.transport;
  const datasets = options.datasets;

  const shouldSample = () => {
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
    const merged = {
      ...normalizeAttributes(base),
      ...normalizeAttributes(attributes),
      timestamp: new Date().toISOString(),
    };
    return merged as LogEvent;
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

    const errorFields = error ? toErrorFields(error) : undefined;

    const event = buildEvent({
      ...(attributes ?? {}),
      ...(errorFields ?? {}),
      "event.name": message,
      "event.type": "log",
      level,
      message,
    });

    emit(datasets.logs, event);
  };

  const event = (name: string, attributes?: Attributes) => {
    if (!shouldLog("info")) return;

    const payload = buildEvent({
      ...(attributes ?? {}),
      "event.name": name,
      "event.type": "event",
      level: "info",
      message: name,
    });

    emit(datasets.logs, payload);
  };

  const metric = (
    name: string,
    value: number,
    attributes?: Attributes,
    options?: MetricOptions,
  ) => {
    if (!shouldSample()) return;

    const payload = buildEvent({
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

    emit(datasets.metrics, payload);
  };

  const flush = async () => {
    if (transport.flush) {
      await transport.flush();
    }
  };

  const child = (attributes: Attributes): Logger => {
    const merged: Attributes = {
      ...base,
      ...attributes,
    };

    return createLogger({
      ...options,
      base: merged,
    });
  };

  return {
    child,
    debug: (message, attributes) => log("debug", message, attributes),
    error: (message, attributes, error) =>
      log("error", message, attributes, error),
    event,
    flush,
    info: (message, attributes) => log("info", message, attributes),
    metric,
    warn: (message, attributes) => log("warn", message, attributes),
  };
}

function normalizeAttributes(attributes: Attributes): Attributes {
  const result: Attributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    const normalized = normalizeValue(value);
    if (normalized === undefined) continue;
    result[key] = normalized;
  }
  return result;
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
    const mapped = value
      .map((item) => normalizeValue(item))
      .filter((item): item is JsonValue => item !== undefined);
    return mapped;
  }

  if (typeof value === "object") {
    const output: Record<string, JsonValue> = {};
    for (const [key, item] of Object.entries(value)) {
      const normalized = normalizeValue(item);
      if (normalized === undefined) continue;
      output[key] = normalized;
    }
    return output;
  }

  return String(value);
}

function toErrorFields(error: unknown): Attributes {
  const err = error instanceof Error ? error : new Error(String(error));
  const includeStack =
    typeof process !== "undefined" &&
    process.env?.["NODE_ENV"] === "development";
  const serialized = serializeError(err, { includeStack });
  const cause = normalizeValue(serialized.cause);

  return {
    "exception.cause": cause,
    "exception.message": serialized.message,
    "exception.stacktrace": serialized.stack,
    "exception.type": serialized.name,
  };
}
