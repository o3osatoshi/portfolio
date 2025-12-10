import type { Attributes, Span } from "@opentelemetry/api";

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
  debug(message: string, fields?: LoggerFields): void;
  error(message: string, fields?: { error?: unknown } & LoggerFields): void;
  info(message: string, fields?: LoggerFields): void;
  warn(message: string, fields?: LoggerFields): void;
}

export type LoggerFields = Attributes;

export interface NodeTelemetryOptions extends BaseTelemetryOptions {
  errorReporter?: ErrorReporter;
}

export interface RequestContextInput {
  [key: string]: unknown;
  clientIp?: string;
  httpMethod?: string;
  httpRoute?: string;
  requestId?: string;
  userAgent?: string;
  userId?: null | string;
}

export interface RequestTelemetry {
  end: (fields?: { error?: unknown } & LoggerFields) => void;
  logger: Logger;
  span: Span;
  spanId: string;
  traceId: string;
}
