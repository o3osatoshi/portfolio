import type { ClientOptions } from "@axiomhq/js";

import type { Env, JsonValue } from "@o3osatoshi/toolkit";

/**
 * Attribute map attached to log and metric events.
 *
 * @remarks
 * - Values must be JSON-compatible.
 * - `undefined` values are omitted when emitted.
 *
 * @public
 */
export type Attributes = Record<string, JsonValue | undefined>;

/**
 * Shared logging configuration for all runtimes.
 *
 * @public
 */
export interface BaseLoggingOptions {
  /**
   * Axiom configuration for sending events.
   */
  client: ClientOptions;
  /**
   * Target datasets for logs and metrics.
   */
  datasets: LoggingDatasets;
  /**
   * Canonical environment label.
   */
  env: Env;
  /**
   * Optional minimum log level.
   *
   * @defaultValue undefined (all levels are emitted)
   */
  minLevel?: LogLevel;
  /**
   * Optional sampling rate (0..1) applied to log/event emission.
   *
   * @defaultValue undefined (no sampling)
   */
  sampleRate?: number;
  /**
   * Logical service name.
   */
  service: string;
}

/**
 * Event shape emitted by loggers.
 *
 * @remarks
 * The `timestamp` field is always set by the logger.
 *
 * @public
 */
export interface LogEvent extends Attributes {
  /**
   * Optional log level label.
   */
  level?: LogLevel;
  /**
   * Optional message label.
   */
  message?: string;
  /**
   * ISO 8601 timestamp.
   */
  timestamp: string;
}

/**
 * Structured logging interface used across runtimes.
 *
 * @public
 */
export interface Logger {
  /**
   * Create a child logger that inherits the base attributes.
   */
  child(attributes: Attributes): Logger;
  /**
   * Emit a debug log event.
   */
  debug(message: string, attributes?: Attributes): void;
  /**
   * Emit an error log event.
   */
  error(message: string, attributes?: Attributes, error?: unknown): void;
  /**
   * Emit a named event (semantically distinct from logs).
   */
  event(name: string, attributes?: Attributes): void;
  /**
   * Flush any buffered events.
   */
  flush(): Promise<void>;
  /**
   * Emit an info log event.
   */
  info(message: string, attributes?: Attributes): void;
  /**
   * Emit a metric event to the metrics dataset.
   */
  metric(
    name: string,
    value: number,
    attributes?: Attributes,
    options?: MetricOptions,
  ): void;
  /**
   * Emit a warn log event.
   */
  warn(message: string, attributes?: Attributes): void;
}

/**
 * Dataset names for log and metric events.
 *
 * @public
 */
export interface LoggingDatasets {
  /**
   * Dataset for log and event records.
   */
  logs: string;
  /**
   * Dataset for metric events.
   */
  metrics: string;
}

/**
 * Supported log levels.
 *
 * @public
 */
export type LogLevel = "debug" | "error" | "info" | "warn";

/**
 * Options applied to metrics emitted via {@link Logger.metric}.
 *
 * @public
 */
export interface MetricOptions {
  /**
   * Metric kind.
   */
  kind?: "counter" | "gauge" | "histogram";
  /**
   * Unit label (for example, `ms` or `1`).
   */
  unit?: string;
}

/**
 * Logging configuration for Node runtimes.
 *
 * @public
 */
export interface NodeLoggingOptions extends RuntimeLoggingOptions {
  /**
   * Flush buffered logs on process exit.
   *
   * @defaultValue true
   */
  flushOnExit?: boolean;
}

/**
 * Request metadata used to seed request-scoped loggers.
 *
 * @public
 */
export interface RequestContext {
  /**
   * Client IP address when available.
   */
  clientIp?: string | undefined;
  /**
   * HTTP method (e.g. GET, POST).
   */
  httpMethod?: string | undefined;
  /**
   * Route template (e.g. `/api/items/:id`).
   */
  httpRoute?: string | undefined;
  /**
   * Request correlation identifier.
   */
  requestId?: string | undefined;
  /**
   * Explicit span id when available.
   */
  spanId?: string | undefined;
  /**
   * Explicit trace id when available.
   */
  traceId?: string | undefined;
  /**
   * W3C `traceparent` header value.
   */
  traceparent?: string | undefined;
  /**
   * Raw user-agent string.
   */
  userAgent?: string | undefined;
  /**
   * Authenticated user identifier.
   */
  userId?: null | string | undefined;
}

/**
 * Request-scoped logging helpers.
 *
 * @public
 */
export interface RequestLogger {
  /**
   * Flush any buffered events.
   */
  flush: () => Promise<void>;
  /**
   * Logger bound to the request context.
   */
  logger: Logger;
  /**
   * Optional parent span identifier.
   */
  parentSpanId?: string;
  /**
   * Request correlation identifier.
   */
  requestId?: string;
  /**
   * Update the authenticated user identifier.
   *
   * @remarks
   * Subsequent logs include the updated `enduser.id` value.
   */
  setUserId: (userId?: null | string) => void;
  /**
   * Span identifier for correlation.
   */
  spanId: string;
  /**
   * Trace identifier for correlation.
   */
  traceId: string;
}

/**
 * Logging configuration for edge and browser runtimes.
 *
 * @public
 */
export interface RuntimeLoggingOptions extends BaseLoggingOptions {
  /**
   * Flush after each request or visibility event when enabled.
   *
   * @remarks
   * Edge/Browser helpers default this to `true` when omitted.
   */
  flushOnEnd?: boolean;
  /**
   * Optional error handler invoked when ingestion fails.
   *
   * @remarks
   * When omitted, the Axiom transport falls back to `console.error`.
   */
  onError?: (error: Error) => void;
}

/**
 * Generic transport interface for emitting events.
 *
 * @public
 */
export interface Transport {
  /**
   * Emit one or more events to the given dataset.
   *
   * @remarks
   * Implementations may return `void` for fire-and-forget transports.
   */
  emit(dataset: string, events: LogEvent | LogEvent[]): Promise<void> | void;
  /**
   * Flush buffered events.
   */
  flush?: () => Promise<void>;
  /**
   * Shutdown the transport.
   */
  shutdown?: () => Promise<void>;
}
