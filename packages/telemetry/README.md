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
  - All runtimes send traces to Axiom via OTLP/HTTP using:
    - `axiom.apiToken` – Axiom API token used in the `Authorization` header.
    - `axiom.otlpEndpoint` – OTLP traces endpoint, e.g. `https://api.axiom.co/v1/traces`.
- **Service and environment labels**
  - Each runtime attaches:
    - `service.name` – from `serviceName`.
    - `deployment.environment` – from `env` (`"development" | "local" | "production" | "staging"`).
- **Request‑scoped telemetry**
  - Node/Edge helpers create a span per incoming request and expose:
    - `logger` – convenience logger that enriches span events.
    - `end(attributes?)` – closes the span and optionally records an error + extra attributes.

## Node usage (`@o3osatoshi/telemetry/node`)

### Initialisation

```ts
import { initNodeTelemetry } from "@o3osatoshi/telemetry/node";

initNodeTelemetry({
  axiom: {
    apiToken: process.env.AXIOM_API_TOKEN!,
    otlpEndpoint: "https://api.axiom.co/v1/traces",
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
    telemetry.logger.error("unhandled error", { error });
    telemetry.end({ error });
    throw error;
  }
}
```

- `createRequestTelemetry(ctx)` returns:
  - `span` – the underlying OpenTelemetry span.
  - `spanId` / `traceId` – IDs suitable for logging or correlation headers.
  - `logger` – `debug` / `info` / `warn` / `error` helpers that add a `"log"` event to the span.
  - `end(attributes?)` – records `attributes.error` (if present) as an exception and attaches all defined attributes as span attributes.

When an `errorReporter` is configured and `end({ error })` is called in Node:
- The reporter receives the error and a context payload (`requestId`, `spanId`, `traceId`, `userId`).
- If it returns a string (e.g. a Sentry event ID), it is attached as `sentry_event_id` on the span.

## Edge usage (`@o3osatoshi/telemetry/edge`)

### Initialisation

```ts
import type { Env } from "@o3osatoshi/toolkit";
import { initEdgeTelemetry } from "@o3osatoshi/telemetry/edge";

export function init(env: Env, axiomToken: string, axiomUrl: string) {
  initEdgeTelemetry({
    axiom: {
      apiToken: axiomToken,
      otlpEndpoint: axiomUrl,
    },
    env,
    serviceName: "my-edge-service",
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
      telemetry.logger.error("edge error", { error });
      telemetry.end({ error });
      throw error;
    }
  },
};
```

The semantics mirror the Node helpers, but use OpenTelemetry’s `BasicTracerProvider` and `BatchSpanProcessor` suitable for Edge runtimes (for example, Cloudflare Workers).

## Browser usage (`@o3osatoshi/telemetry/browser`)

### Initialisation

```ts
import { initBrowserTelemetry } from "@o3osatoshi/telemetry/browser";

initBrowserTelemetry({
  axiom: {
    apiToken: window.ENV.AXIOM_API_TOKEN,
    otlpEndpoint: "https://api.axiom.co/v1/traces",
  },
  env: "production",
  serviceName: "my-web-app",
});
```

Call `initBrowserTelemetry` once during app startup (for example, in your app bootstrap file). The function is idempotent.

### UX logger

```ts
import {
  createBrowserLogger,
  type BrowserSessionContext,
} from "@o3osatoshi/telemetry/browser";

const session: BrowserSessionContext = {
  sessionId: "session-123",
  userId: "user-1",
};

const logger = createBrowserLogger(session);

// Track a UX event
logger.event("button_clicked", { button: "primary" });

// Emit a log on the active span (if any)
logger.info("navigated to settings", { page: "/settings" });
```

- `createBrowserLogger(session)`:
  - Enriches all events with `session_id` and `user_id`.
  - `event(name, attrs)` creates a short‑lived span per UX event and records a `"ux_event"` event.
  - `debug` / `info` / `warn` / `error` add `"log"` events to the current active span (if available).
  - When an `errorReporter` is configured for the Edge or Node runtime, `error` logs with an attached `error` value will forward that error (plus request/span context) to the reporter and attach any returned event identifier (for example, a Sentry event ID) to the span as `sentry_event_id`.

## Types

All runtime options share a common configuration shape:

- `AxiomConfig`
  - `apiToken: string` – Axiom API token.
  - `otlpEndpoint: string` – OTLP/HTTP traces endpoint.
- `BaseTelemetryOptions`
  - `axiom: AxiomConfig`
  - `dataset: string` – target Axiom dataset name used for OTLP traces (propagated via the `X-Axiom-Dataset` header).
  - `env: Env` – canonical deployment environment (`"development" | "local" | "production" | "staging"`).
  - `sampleRate?: number` – reserved hint for future sampling configuration.
  - `serviceName: string`
- `ErrorAttributes`
  - Extends `Attributes` with an optional `error?: unknown` field used by `logger.error` and `RequestTelemetry["end"]` to record exceptions and feed the configured `errorReporter`.
- `NodeTelemetryOptions`, `EdgeTelemetryOptions`, `BrowserTelemetryOptions`
  - Runtime‑specific extensions of `BaseTelemetryOptions`.
- `RequestContext`
  - Request metadata for `createRequestTelemetry` (client IP, HTTP method/route, requestId, userAgent, userId).
- `RequestTelemetry`
  - `{ span, spanId, traceId, logger, end }` as returned from `createRequestTelemetry`.
- `Logger`
  - Minimal logger interface used across runtimes with `debug` / `info` / `warn` / `error`.

Consult the generated API docs for a complete list of exported types and functions.

## Node version

- Requires Node **22.x** for all runtime entry points.
- Edge/browser bundles target modern runtimes compatible with the bundled OpenTelemetry SDKs.
