# @o3osatoshi/telemetry

Shared [OpenTelemetry](https://opentelemetry.io/) helpers and Axiom OTLP exporters for Node, Edge, and browser runtimes.

Focused on:
- Small surface area (a few functions/types per runtime)
- Convention‑driven attributes (request IDs, user IDs, service/env labels)
- Axiom OTLP/HTTP out of the box

> Status: early but production‑oriented. Minor breaking changes are still possible while APIs settle.

## Install

```bash
pnpm add @o3osatoshi/telemetry
```

The package bundles the required OpenTelemetry SDK/exporter dependencies internally; consumers only need to depend on `@o3osatoshi/telemetry`.

## Concepts

- **Axiom OTLP/HTTP**
  - All runtimes send traces to Axiom via OTLP/HTTP.
  - Node and browser runtimes also wire metrics and log records to the same OTLP endpoint using:
    - `axiom.apiToken` – Axiom API token used in the `Authorization` header.
    - `axiom.otlpEndpoint` – OTLP endpoint for traces/metrics/logs, e.g. `https://api.axiom.co/v1/traces`.
- **Service and environment labels**
  - Each runtime attaches:
    - `service.name` – from `serviceName`.
    - `deployment.environment` – from `env` (`"development" | "local" | "production" | "staging"`).
- **Request‑scoped telemetry**
  - Node/Edge helpers create a span per incoming request and expose:
    - `logger` – convenience logger that enriches span events.
    - `end(attributes?)` – closes the span and optionally records an error + extra attributes.

## Node usage (`@o3osatoshi/telemetry/node`)

### Initialization

```ts
import { initNodeTelemetry } from "@o3osatoshi/telemetry/node";

initNodeTelemetry({
  axiom: {
    apiToken: process.env.AXIOM_API_TOKEN!,
    otlpEndpoint: "https://api.axiom.co/v1/traces",
  },
  datasets: {
    traces: "my-node-traces",
    metrics: "my-node-metrics",
    logs: "my-node-logs",
  },
  env: "production",
  serviceName: "my-node-service",
  // Optional: forward errors to Sentry or a similar service
  errorReporter: (error, ctx) => {
    // const eventId = Sentry.captureException(error, { tags: ctx });
    // return eventId;
    return undefined;
  },
});
```

Call `initNodeTelemetry` once during process startup. The function is idempotent and safe to call multiple times.

### Request‑scoped span + logger

```ts
import type { IncomingMessage, ServerResponse } from "node:http";
import { createRequestTelemetry } from "@o3osatoshi/telemetry/node";

export async function handler(req: IncomingMessage, res: ServerResponse) {
  const telemetry = createRequestTelemetry({
    clientIp: req.socket.remoteAddress,
    httpMethod: req.method,
    httpRoute: "/api/items/:id",
    requestId: req.headers["x-request-id"] as string | undefined,
    userAgent: req.headers["user-agent"] as string | undefined,
    userId: undefined,
  });

  try {
    telemetry.logger.info("handling request");
    // …your handler logic…
    telemetry.end({ foo: "bar" });
  } catch (error) {
    telemetry.logger.error("unhandled error", undefined, error);
    telemetry.end(undefined, error);
    throw error;
  }
}
```

- `createRequestTelemetry(ctx)` returns:
  - `span` – the underlying OpenTelemetry span.
  - `spanId` / `traceId` – IDs suitable for logging or correlation headers.
  - `logger` – `debug` / `info` / `warn` / `error` helpers that add a `"log"` event to the span.
  - `end(attributes?, error?)` – records `error` as an exception when provided and attaches all defined attributes as span attributes.

When an `errorReporter` is configured in Node and you call `telemetry.logger.error("message", attrs, error)`:
- The reporter receives the error and a context payload (`requestId`, `spanId`, `traceId`, `userId`).
- If it returns a string (e.g. a Sentry event ID), it is attached as `sentry_event_id` on the span.

### Process‑level metrics

```ts
import { getNodeMetrics } from "@o3osatoshi/telemetry/node";

const metrics = getNodeMetrics();

const requestCounter = metrics.getCounter("http.server.requests", {
  description: "Number of HTTP requests received",
  unit: "1",
});

// Inside your HTTP handler or middleware
requestCounter.add(1, {
  "http.method": req.method,
  "http.route": "/api/items/:id",
  "http.status_code": res.statusCode,
});
```

- `getNodeMetrics()` returns a helper that creates and caches counter/histogram instruments using the global OpenTelemetry `Meter`.
- Metrics are exported to Axiom via OTLP/HTTP using the `datasets.metrics` configuration from {@link NodeTelemetryOptions}.

### Process‑level logs

```ts
import { createNodeLogger } from "@o3osatoshi/telemetry/node";

const log = createNodeLogger();

log.info("server_started", {
  service: "my-node-service",
  env: process.env.NODE_ENV,
});

try {
  // …background job logic…
} catch (error) {
  log.error("background_job_failed", {
    job_name: "sync-transactions",
    error_message: error instanceof Error ? error.message : String(error),
  });
}
```

- `createNodeLogger()` returns a process‑level logger that emits OpenTelemetry log records via the logs API.
- Log records are exported to Axiom over OTLP/HTTP alongside traces and metrics.

### Business events

```ts
import {
  addBusinessEventToActiveSpan,
  addErrorBusinessEventToActiveSpan,
} from "@o3osatoshi/telemetry/node";

addBusinessEventToActiveSpan("user_signed_in", {
  user_id: "user-1",
});

try {
  // …domain or application logic…
} catch (error) {
  addErrorBusinessEventToActiveSpan(
    "user_signup_failed",
    { reason: "validation" },
    error,
  );
  throw error;
}
```

- Business events rely on an active span (for example, established via `withRequestTelemetry` or `createRequestTelemetry`).
- `addBusinessEventToActiveSpan` attaches a `"business_event"` span event with your attributes.
- `addErrorBusinessEventToActiveSpan` additionally records the error as an exception and sets `level: "error"` on the event.

## Edge usage (`@o3osatoshi/telemetry/edge`)

### Initialization

```ts
import type { Env } from "@o3osatoshi/toolkit";
import { initEdgeTelemetry } from "@o3osatoshi/telemetry/edge";

export function init(env: Env, axiomToken: string, axiomUrl: string) {
  initEdgeTelemetry({
    axiom: {
      apiToken: axiomToken,
      otlpEndpoint: axiomUrl,
    },
    datasets: {
      traces: "my-edge-traces",
      metrics: "my-edge-metrics",
      logs: "my-edge-logs",
    },
    env,
    serviceName: "my-edge-service",
    // Optional: forward errors to Sentry or a similar service
    errorReporter: (error, ctx) => {
      // const eventId = Sentry.captureException(error, { tags: ctx });
      // return eventId;
      return undefined;
    },
  });
}
```

Call `initEdgeTelemetry` once during worker bootstrap. It is idempotent.

### Request‑scoped span + logger

```ts
import { createRequestTelemetry } from "@o3osatoshi/telemetry/edge";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    const telemetry = createRequestTelemetry({
      clientIp: request.headers.get("cf-connecting-ip") ?? undefined,
      httpMethod: request.method,
      httpRoute: url.pathname,
      requestId: request.headers.get("x-request-id") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      userId: undefined,
    });

    try {
      telemetry.logger.info("edge request received");
      // …handler logic…
      telemetry.end({ foo: "edge" });
      return new Response("ok");
    } catch (error) {
      telemetry.logger.error("edge error", undefined, error);
      telemetry.end(undefined, error);
      throw error;
    }
  },
};
```

The semantics mirror the Node helpers, but use OpenTelemetry’s `BasicTracerProvider` and `BatchSpanProcessor` suitable for Edge runtimes (for example, Cloudflare Workers).

## Browser usage (`@o3osatoshi/telemetry/browser`)

### Initialization

```ts
import { initBrowserTelemetry } from "@o3osatoshi/telemetry/browser";

initBrowserTelemetry({
  axiom: {
    apiToken: window.ENV.AXIOM_API_TOKEN,
    otlpEndpoint: "https://api.axiom.co/v1/traces",
  },
  datasets: {
    traces: "my-browser-traces",
    metrics: "my-browser-metrics",
    logs: "my-browser-logs",
  },
  env: "production",
  serviceName: "my-web-app",
});
```

Call `initBrowserTelemetry` once during app startup (for example, in your app bootstrap file). The function is idempotent.

### UX logger

```ts
import {
  createEventLogger,
  getBrowserMetrics,
  type BrowserSessionContext,
} from "@o3osatoshi/telemetry/browser";

const session: BrowserSessionContext = {
  sessionId: "session-123",
  userId: "user-1",
};

const logger = createEventLogger(session);

// Track a UX event
logger.event("button_clicked", { button: "primary" });

// Emit a log on the active span (if any)
logger.info("navigated to settings", { page: "/settings" });
```

- `createEventLogger(session)`:
  - Enriches all events with `session_id` and `user_id`.
  - `event(name, attrs)` creates a short‑lived span per UX event and records a `"ux_event"` event.
  - `debug` / `info` / `warn` / `error` add `"log"` events to the current active span (if available).
  - Note: the `errorReporter` option is only supported for the Node and Edge runtimes; browser loggers do not forward errors to an external reporter.

### Browser metrics

```ts
const metrics = getBrowserMetrics();

const viewCounter = metrics.getCounter("ui.view_count", {
  description: "Number of times a view was shown",
  unit: "1",
});

viewCounter.add(1, {
  "view.name": "settings",
});
```

- `getBrowserMetrics()` returns a helper that creates and caches counter/histogram instruments.
- Metrics are exported to Axiom via OTLP/HTTP using the `datasets.metrics` configuration from {@link BrowserTelemetryOptions}.

### Browser logs (OTel Logs API)

```ts
import { createBrowserLogger } from "@o3osatoshi/telemetry/browser";

const appLog = createBrowserLogger();

appLog.info("page_loaded", {
  path: window.location.pathname,
});

appLog.error("frontend_error", {
  error_message: error instanceof Error ? error.message : String(error),
});
```

- `createBrowserLogger()` returns an application‑level logger that emits OpenTelemetry log records.
- Log records are exported over OTLP/HTTP alongside traces and metrics when `initBrowserTelemetry` has been called.

## Types

All runtime options share a common configuration shape:

- `AxiomConfig`
  - `apiToken: string` – Axiom API token.
  - `otlpEndpoint: string` – OTLP/HTTP traces endpoint.
- `BaseTelemetryOptions`
  - `axiom: AxiomConfig`
  - `datasets: TelemetryDatasets` – target Axiom dataset names used for each telemetry signal (propagated via the `X-Axiom-Dataset` header).
  - `env: Env` – canonical deployment environment (`"development" | "local" | "production" | "staging"`).
  - `sampleRate?: number` – reserved hint for future sampling configuration.
  - `serviceName: string`
- `TelemetryDatasets`
  - `traces: string` – dataset for OpenTelemetry traces.
  - `metrics: string` – dataset for OpenTelemetry metrics.
  - `logs: string` – dataset for OpenTelemetry log records.
- `Attributes`
  - Thin alias over OpenTelemetry’s `Attributes` type; used for span attributes, log attributes, and metric attributes.
- `NodeTelemetryOptions`, `EdgeTelemetryOptions`, `BrowserTelemetryOptions`
  - Runtime‑specific extensions of `BaseTelemetryOptions`.
  - `NodeTelemetryOptions.errorReporter?` / `EdgeTelemetryOptions.errorReporter?` can be used to integrate with external error reporting systems (for example, Sentry). Browser telemetry options do not support an `errorReporter`.
- `RequestContext`
  - Request metadata for `createRequestTelemetry` (client IP, HTTP method/route, requestId, userAgent, userId).
- `RequestTelemetry`
  - `{ span, spanId, traceId, logger, end }` as returned from `createRequestTelemetry`.
- `Logger`
  - Minimal logger interface used across runtimes with `debug` / `info` / `warn` / `error`. The `error` method accepts an optional `error` parameter that is recorded on the span and, in Node/Edge, forwarded to the configured `errorReporter` when present.

Consult the generated API docs for a complete list of exported types and functions.

## Node version

- Requires Node **22.x** for all runtime entry points.
- Edge/browser bundles target modern runtimes compatible with the bundled OpenTelemetry SDKs.
