import { context, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type {
  Attributes,
  BrowserTelemetryOptions,
  Logger,
  LogLevel,
} from "./types";

let provider: undefined | WebTracerProvider;

/**
 * Browser-specific logger that records events on OpenTelemetry spans.
 *
 * @remarks
 * - Log methods (`debug` / `info` / `warn` / `error`) annotate the
 *   currently active span (if any).
 * - The `event` helper creates a short-lived span per UX event and
 *   records a `ux_event` with the provided attributes.
 *
 * @public
 */
export interface BrowserLogger extends Logger {
  event: (eventName: string, attributes?: Attributes) => void;
}

/**
 * Session-level context attached to browser telemetry.
 *
 * @public
 */
export interface BrowserSessionContext {
  sessionId: string;
  userId?: null | string;
}

/**
 * Create a browser-side logger enriched with session-level fields.
 *
 * @param session - Session context to attach to all log events.
 * @returns A {@link BrowserLogger} instance bound to the active span.
 *
 * @public
 */
export function createBrowserLogger(
  session: BrowserSessionContext,
): BrowserLogger {
  const baseAttributes: Attributes = {
    session_id: session.sessionId,
    user_id: session.userId ?? undefined,
  };

  const logger = createSpanLogger(baseAttributes);

  const event: BrowserLogger["event"] = (eventName, attributes) => {
    const tracer = trace.getTracer("@o3osatoshi/telemetry/browser");
    const span = tracer.startSpan(eventName);

    span.addEvent("ux_event", {
      event_name: eventName,
      ...baseAttributes,
      ...attributes,
    });
    span.end();

    context.with(trace.setSpan(context.active(), span), () => {
      // Context is active within the span lifetime.
    });
  };

  return {
    ...logger,
    event,
  };
}

/**
 * Initialize OpenTelemetry for browser runtimes.
 *
 * This function is idempotent and can be called multiple times safely.
 *
 * @public
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
      "X-Axiom-Dataset": options.dataset,
    },
    url: options.axiom.otlpEndpoint,
  });

  provider = new WebTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  provider.register();
}

function createSpanLogger(baseAttributes: Attributes): Logger {
  const log = (level: LogLevel, message: string, attributes?: Attributes) => {
    const span = trace.getActiveSpan();
    span?.addEvent("log", {
      level,
      message,
      ...baseAttributes,
      ...attributes,
    });
  };

  return {
    debug: (message, attributes) => log("debug", message, attributes),
    error: (message, attributes) => log("error", message, attributes),
    info: (message, attributes) => log("info", message, attributes),
    warn: (message, attributes) => log("warn", message, attributes),
  };
}
