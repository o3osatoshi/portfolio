import type {
  Attributes as OpenTelemetryAttributes,
  Span,
} from "@opentelemetry/api";

/**
 * Common attribute map used for telemetry events and span logs.
 *
 * @remarks
 * This is a thin alias over the OpenTelemetry {@link @opentelemetry/api#Attributes}
 * type so consumers can depend on a stable shape from this package.
 *
 * @public
 */
export type Attributes = OpenTelemetryAttributes;

/**
 * Configuration for sending OpenTelemetry signals to Axiom over OTLP/HTTP.
 *
 * @remarks
 * This package uses OTLP/HTTP protobuf exporters so that Axiom metrics
 * ingestion works (Axiom's `/v1/metrics` endpoint does not accept OTLP/HTTP JSON).
 *
 * @public
 */
export interface AxiomConfig {
  /**
   * Axiom API token used for authenticating OTLP requests.
   */
  apiToken: string;
  /**
   * Signal-specific OTLP/HTTP endpoints.
   *
   * @remarks
   * OpenTelemetry OTLP/HTTP uses different endpoints for each signal:
   * - traces: `/v1/traces`
   * - metrics: `/v1/metrics`
   * - logs: `/v1/logs`
   */
  otlpEndpoints: AxiomOtlpEndpoints;
}

/**
 * OTLP/HTTP endpoints used for each OpenTelemetry signal.
 *
 * @remarks
 * Each endpoint can be either:
 * - a base endpoint (for example, `https://api.axiom.co`), or
 * - any signal endpoint (for example, `https://api.axiom.co/v1/traces`).
 *
 * Runtime initializers normalize each value so the corresponding signal is sent
 * to the correct path.
 *
 * @public
 */
export interface AxiomOtlpEndpoints {
  /**
   * Endpoint used for log record export.
   */
  logs: string;
  /**
   * Endpoint used for metric export.
   */
  metrics: string;
  /**
   * Endpoint used for trace export.
   */
  traces: string;
}

/**
 * Shared configuration for telemetry initializers across runtimes.
 *
 * @remarks
 * Extended by Node, Edge, and browser telemetry options.
 *
 * @public
 */
export interface BaseTelemetryOptions {
  /**
   * Axiom exporter configuration.
   */
  axiom: AxiomConfig;
  /**
   * Target dataset names used for each telemetry signal.
   */
  datasets: TelemetryDatasets;
  /**
   * Canonical deployment environment label.
   */
  env: Env;
  /**
   * Optional sampling rate hint for traces, expressed as a value between 0 and 1.
   *
   * @remarks
   * Current helpers do not apply this value yet; it is reserved for future sampler configuration.
   */
  sampleRate?: number;
  /**
   * Logical service name used for OpenTelemetry resources.
   */
  serviceName: string;
}

/**
 * Telemetry options for browser runtimes.
 *
 * @public
 */
export interface BrowserTelemetryOptions extends BaseTelemetryOptions {}

/**
 * Telemetry options for Edge runtimes (for example, Cloudflare Workers).
 *
 * @public
 */
export interface EdgeTelemetryOptions extends BaseTelemetryOptions {
  /**
   * Optional callback for reporting errors to an external system
   * (for example, Sentry) from Edge runtimes.
   */
  errorReporter?: ErrorReporter;
}

/**
 * Canonical deployment environment label.
 *
 * @remarks
 * Values are intentionally small and opinionated to match common deployment
 * stages.
 *
 * @public
 */
export type Env = "development" | "local" | "production" | "staging";

/**
 * Callback used to report errors to an external system.
 *
 * @remarks
 * The optional return value can be an opaque event identifier that
 * runtime-specific helpers may attach to spans (for example, a Sentry event ID).
 *
 * @public
 */
export type ErrorReporter = (
  error: unknown,
  context?: ErrorReporterContext,
) => string | undefined;

/**
 * Context passed to an {@link ErrorReporter} implementation.
 *
 * @public
 */
export interface ErrorReporterContext {
  /**
   * Additional fields that may be provided by runtime-specific helpers.
   */
  [key: string]: unknown;
  /**
   * Correlation identifier for the current request, when available.
   */
  requestId?: string | undefined;
  /**
   * OpenTelemetry span identifier associated with the error, when available.
   */
  spanId?: string | undefined;
  /**
   * OpenTelemetry trace identifier associated with the error, when available.
   */
  traceId?: string | undefined;
  /**
   * Authenticated user identifier, if present.
   */
  userId?: null | string | undefined;
}

/**
 * Minimal logger used by telemetry helpers.
 *
 * @remarks
 * Implementations typically log to the active span rather than stdout.
 * Some runtime helpers may also emit OpenTelemetry log records when a log
 * exporter is configured.
 *
 * @public
 */
export interface Logger {
  /**
   * Record a debug-level message.
   */
  debug(message: string, attributes?: Attributes): void;
  /**
   * Record an error-level message.
   *
   * @remarks
   * When `error` is provided, runtime-specific implementations may also record
   * it as an exception on the active span or report it via an error reporter.
   */
  error(message: string, attributes?: Attributes, error?: unknown): void;
  /**
   * Record an info-level message.
   */
  info(message: string, attributes?: Attributes): void;
  /**
   * Record a warn-level message.
   */
  warn(message: string, attributes?: Attributes): void;
}

/**
 * Counter metric wrapper used by the runtime telemetry helpers.
 *
 * @remarks
 * Provides a small, stable interface over the OpenTelemetry counter instrument.
 *
 * @public
 */
export interface MetricCounter {
  /**
   * Increase the counter by `value`.
   */
  add(value: number, attributes?: Attributes): void;
}

/**
 * Histogram metric wrapper used by the runtime telemetry helpers.
 *
 * @remarks
 * Histograms are typically used for recording request durations or sizes.
 *
 * @public
 */
export interface MetricHistogram {
  /**
   * Record a measurement.
   */
  record(value: number, attributes?: Attributes): void;
}

/**
 * Options passed when creating metric instruments.
 *
 * @remarks
 * Values are forwarded to the underlying OpenTelemetry `Meter` when calling
 * `createCounter` / `createHistogram`.
 *
 * @public
 */
export interface MetricOptions {
  /**
   * Human readable description of what the metric measures.
   */
  description?: string;
  /**
   * Unit label for the metric values (for example, `"ms"` or `"1"`).
   */
  unit?: string;
}

/**
 * Telemetry options for Node runtimes.
 *
 * @public
 */
export interface NodeTelemetryOptions extends BaseTelemetryOptions {
  /**
   * Optional callback for reporting errors to an external system
   * (for example, Sentry). When it returns an event identifier,
   * the ID is attached to the active span as an attribute.
   */
  errorReporter?: ErrorReporter;
}

/**
 * Request metadata used when creating a request-scoped span.
 *
 * @public
 */
export interface RequestContext {
  /**
   * Additional fields that may be provided by callers and forwarded to error reporters.
   */
  [key: string]: unknown;
  /**
   * Client IP address, if known.
   */
  clientIp?: string | undefined;
  /**
   * HTTP method (for example, GET or POST).
   */
  httpMethod?: string | undefined;
  /**
   * Logical HTTP route template (for example, `/api/users/:id`).
   */
  httpRoute?: string | undefined;
  /**
   * Correlation identifier for the request, when available.
   */
  requestId?: string | undefined;
  /**
   * Raw user agent string, if available.
   */
  userAgent?: string | undefined;
  /**
   * Authenticated user identifier, if present.
   */
  userId?: null | string | undefined;
}

/**
 * Request-scoped telemetry helpers returned by the runtime-specific
 * `createRequestTelemetry` helpers.
 *
 * @public
 */
export interface RequestTelemetry {
  /**
   * End the span and optionally attach error/attribute information.
   */
  end: (attributes?: Attributes, error?: unknown) => void;
  /**
   * Logger bound to the span and request context.
   */
  logger: Logger;
  /**
   * Update the authenticated user identifier for the current request span.
   *
   * @remarks
   * - Updates both the span attribute (`enduser.id`) and any runtime-specific
   *   logger context that is derived from the request user identifier.
   * - Intended to be called after authentication middleware resolves the user.
   *
   * @param userId - Authenticated user identifier, if available.
   */
  setUserId: (userId?: null | string) => void;
  /**
   * Underlying OpenTelemetry span representing the request.
   */
  span: Span;
  /**
   * Identifier of the request span.
   */
  spanId: string;
  /**
   * Trace identifier shared across spans in the same request.
   */
  traceId: string;
}

/**
 * Log severity levels supported by {@link Logger}.
 *
 * @public
 */
export type Severity = "debug" | "error" | "info" | "warn";

/**
 * Dataset names used for each telemetry signal.
 *
 * @remarks
 * All datasets should refer to Axiom "Events" datasets configured to receive
 * OpenTelemetry data for the corresponding signal type.
 *
 * @public
 */
export interface TelemetryDatasets {
  /**
   * Target dataset for OpenTelemetry log records.
   */
  logs: string;
  /**
   * Target dataset for OpenTelemetry metrics.
   */
  metrics: string;
  /**
   * Target dataset for OpenTelemetry traces.
   */
  traces: string;
}
