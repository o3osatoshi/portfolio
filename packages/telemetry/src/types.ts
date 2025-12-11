import type {
  Attributes as OpenTelemetryAttributes,
  Span,
} from "@opentelemetry/api";

import type { Env } from "@o3osatoshi/toolkit";

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
 * Configuration for sending OTLP traces to Axiom.
 *
 * @public
 */
export interface AxiomConfig {
  /**
   * Axiom API token used for authenticating OTLP requests.
   */
  apiToken: string;
  /**
   * OTLP/HTTP endpoint for sending traces to Axiom.
   *
   * Typically looks like:
   * `https://api.axiom.co/v1/traces`
   */
  otlpEndpoint: string;
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
   * Canonical deployment environment label shared with `@o3osatoshi/toolkit`.
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
 * Attributes associated with an error event.
 *
 * @remarks
 * - Extends the common {@link Attributes} map with an optional `error` field.
 * - When provided, `error` is recorded as an exception on the current span
 *   and may be forwarded to an {@link ErrorReporter} implementation.
 *
 * @public
 */
export type ErrorAttributes = { error?: unknown } & Attributes;

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
 *
 * @public
 */
export interface Logger {
  debug(message: string, attributes?: Attributes): void;
  error(message: string, attributes?: ErrorAttributes): void;
  info(message: string, attributes?: Attributes): void;
  warn(message: string, attributes?: Attributes): void;
}

/**
 * Log severity levels supported by {@link Logger}.
 *
 * @public
 */
export type LogLevel = "debug" | "error" | "info" | "warn";

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
  [key: string]: unknown;
  /**
   * Client IP address, if known.
   */
  clientIp?: string;
  /**
   * HTTP method (for example, GET or POST).
   */
  httpMethod?: string;
  /**
   * Logical HTTP route template (for example, `/api/users/:id`).
   */
  httpRoute?: string;
  /**
   * Correlation identifier for the request, when available.
   */
  requestId?: string;
  /**
   * Raw user agent string, if available.
   */
  userAgent?: string;
  /**
   * Authenticated user identifier, if present.
   */
  userId?: null | string;
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
  end: (attributes?: ErrorAttributes) => void;
  /**
   * Logger bound to the span and request context.
   */
  logger: Logger;
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
