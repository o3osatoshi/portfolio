import type {
  Attributes as OpenTelemetryAttributes,
  Span,
} from "@opentelemetry/api";

export type Attributes = OpenTelemetryAttributes;

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

export interface BaseTelemetryOptions {
  axiom: AxiomConfig;
  env: Env;
  sampleRate?: number;
  serviceName: string;
}

export interface BrowserTelemetryOptions extends BaseTelemetryOptions {}

export interface EdgeTelemetryOptions extends BaseTelemetryOptions {
  errorReporter?: ErrorReporter;
}

export type Env = "development" | "local" | "production" | "staging";

export type ErrorReporter = (
  error: unknown,
  context?: ErrorReporterContext,
) => string | undefined;

export interface ErrorReporterContext {
  [key: string]: unknown;
  requestId?: string | undefined;
  spanId?: string | undefined;
  traceId?: string | undefined;
  userId?: null | string | undefined;
}

export interface Logger {
  debug(message: string, attributes?: Attributes): void;
  error(message: string, attributes?: { error?: unknown } & Attributes): void;
  info(message: string, attributes?: Attributes): void;
  warn(message: string, attributes?: Attributes): void;
}

export type LogLevel = "debug" | "error" | "info" | "warn";

export interface NodeTelemetryOptions extends BaseTelemetryOptions {
  errorReporter?: ErrorReporter;
}

export interface RequestContext {
  [key: string]: unknown;
  clientIp?: string;
  httpMethod?: string;
  httpRoute?: string;
  requestId?: string;
  userAgent?: string;
  userId?: null | string;
}

export interface RequestTelemetry {
  end: (attributes?: { error?: unknown } & Attributes) => void;
  logger: Logger;
  span: Span;
  spanId: string;
  traceId: string;
}
