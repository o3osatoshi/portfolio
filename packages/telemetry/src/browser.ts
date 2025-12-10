import { context, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type { BrowserTelemetryOptions, Logger, LoggerFields } from "./types";

let provider: undefined | WebTracerProvider;

export interface BrowserLogger extends Logger {
  event: (eventName: string, fields?: LoggerFields) => void;
}

export interface BrowserSessionContext {
  sessionId: string;
  userId?: null | string;
}

/**
 * Create a browser-side logger tied to the current active span, enriched
 * with session-level fields.
 */
export function createBrowserLogger(
  session: BrowserSessionContext,
): BrowserLogger {
  const baseFields: LoggerFields = {
    session_id: session.sessionId,
    user_id: session.userId ?? undefined,
  };

  const logger = createSpanLogger(baseFields);

  const event: BrowserLogger["event"] = (eventName, fields) => {
    const tracer = trace.getTracer("@o3osatoshi/telemetry/browser");
    const span = tracer.startSpan(eventName);
    const spanCtx = trace.setSpan(context.active(), span);

    const mergedFields: LoggerFields = {
      event_name: eventName,
      ...baseFields,
      ...fields,
    };

    span.addEvent("ux_event", mergedFields);
    span.end();

    context.with(spanCtx, () => {
      // Context is active within the span lifetime.
    });
  };

  return {
    ...logger,
    event,
  };
}

/**
 * Initialise OpenTelemetry for browser runtimes.
 *
 * This function is idempotent and can be called multiple times safely.
 */
export function initBrowserTelemetry(options: BrowserTelemetryOptions): void {
  if (provider) return;

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: options.serviceName,
    "deployment.environment": options.env,
  });

  const exporter = new OTLPTraceExporter({
    headers: {
      Authorization: `Bearer ${options.axiom.apiToken}`,
    },
    url: options.axiom.otlpEndpoint,
  });

  provider = new WebTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  provider.register();
}

function createSpanLogger(baseFields: LoggerFields): Logger {
  const log = (
    level: "debug" | "error" | "info" | "warn",
    message: string,
    fields?: LoggerFields,
  ) => {
    const span = trace.getActiveSpan();
    const merged: LoggerFields = {
      level,
      message,
      ...baseFields,
      ...fields,
    };

    span?.addEvent("log", merged);
  };

  return {
    debug: (message, fields) => log("debug", message, fields),
    error: (message, fields) => log("error", message, fields),
    info: (message, fields) => log("info", message, fields),
    warn: (message, fields) => log("warn", message, fields),
  };
}
