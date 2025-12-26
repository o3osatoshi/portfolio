# @o3osatoshi/logging

Axiom-first logging helpers for Node, Edge, and browser runtimes.

Focus:
- Small surface area with consistent fields across runtimes
- Logs + metrics separated into dedicated Axiom datasets
- Trace context fields (`trace_id`, `span_id`) aligned with OpenTelemetry naming
- Next.js helpers available via `@o3osatoshi/logging/nextjs`

## Install

```bash
pnpm add @o3osatoshi/logging
```

## Concepts

- **Datasets**
  - `datasets.logs` and `datasets.metrics` are required.
  - Logs and metrics are emitted as structured events to their respective datasets.
- **Service and environment**
  - Each event includes `service.name` and `deployment.environment`.
- **Trace context**
  - Request helpers attach `trace_id`, `span_id`, and `parent_span_id` (when available).
  - Incoming `traceparent` headers are parsed if provided.

## Node usage (`@o3osatoshi/logging/node`)

### Initialization

```ts
import { initNodeLogger } from "@o3osatoshi/logging/node";

initNodeLogger({
  client: {
    token: process.env.AXIOM_API_TOKEN!,
  },
  datasets: {
    logs: "logs",
    metrics: "metrics",
  },
  env: "production",
  service: "portfolio-web",
  minLevel: "info",
  flushOnEnd: false,
});
```

### Request-scoped logging

```ts
import { withRequestLogger } from "@o3osatoshi/logging/node";

await withRequestLogger(
  {
    clientIp: req.headers.get("x-forwarded-for") ?? undefined,
    httpMethod: req.method,
    httpRoute: "/api/items/:id",
    requestId: req.headers.get("x-request-id") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  },
  async (request) => {
    request.logger.info("http_request_received");

    try {
      // ...your handler...
      request.logger.metric("http.server.requests", 1, {
        "http.method": req.method,
        "http.route": "/api/items/:id",
        "http.status_code": 200,
      }, { kind: "counter", unit: "1" });
    } finally {
      await request.flush();
    }
  },
);
```

### Process-level logging

```ts
import { createNodeLogger } from "@o3osatoshi/logging/node";

const log = createNodeLogger();
log.info("server_started", { node_version: process.version });
```

## Edge usage (`@o3osatoshi/logging/edge`)

```ts
import { initEdgeLogger, withRequestLogger } from "@o3osatoshi/logging/edge";

initEdgeLogger({
  client: { token: env.AXIOM_API_TOKEN },
  datasets: { logs: "logs", metrics: "metrics" },
  env: "production",
  service: "portfolio-edge",
});

await withRequestLogger({ httpMethod: "GET", httpRoute: "/edge/healthz" }, (req) => {
  req.logger.info("edge_request");
});
```

## Browser usage (`@o3osatoshi/logging/browser`)

```ts
import { initBrowserLogger, createBrowserLogger } from "@o3osatoshi/logging/browser";

initBrowserLogger({
  client: { token: window.ENV.AXIOM_API_TOKEN },
  datasets: { logs: "logs", metrics: "metrics" },
  env: "production",
  service: "portfolio-web",
});

const log = createBrowserLogger();
log.event("page_view", { path: window.location.pathname });
```

## Proxy transport (`@o3osatoshi/logging/proxy`)

Use the proxy transport when you want to send client logs to your server before
ingesting them into Axiom (for example, to avoid exposing tokens).

### Client-side (browser)

```ts
import { initBrowserLogger } from "@o3osatoshi/logging/browser";
import { createProxyTransport } from "@o3osatoshi/logging/proxy";

initBrowserLogger({
  transport: createProxyTransport({
    url: "/api/logging",
    flushIntervalMs: 1000,
  }),
  datasets: { logs: "logs", metrics: "metrics" },
  env: "production",
  service: "portfolio-web",
});
```

### Server-side (Edge/Node)

```ts
import { createEdgeProxyHandler } from "@o3osatoshi/logging/edge";

export const POST = createEdgeProxyHandler({
  allowDatasets: (process.env.LOGGING_ALLOWED_DATASETS ?? "logs,metrics").split(
    ",",
  ),
});
```

Node runtimes can use `createNodeProxyHandler` from `@o3osatoshi/logging/node`.

## Custom transport

Runtime helpers accept a custom `transport` if you want to swap away from Axiom:

```ts
import { initNodeLogger } from "@o3osatoshi/logging/node";

initNodeLogger({
  transport: customTransport,
  datasets: { logs: "logs", metrics: "metrics" },
  env: "production",
  service: "portfolio-web",
});
```

## Axiom helpers (`@o3osatoshi/logging/axiom`)

```ts
import { createAxiomTransport } from "@o3osatoshi/logging/axiom";
import { createLogger } from "@o3osatoshi/logging";

const transport = createAxiomTransport({
  token: process.env.AXIOM_API_TOKEN!,
  mode: "batch",
});

const logger = createLogger({
  attributes: { "service.name": "portfolio-web" },
  datasets: { logs: "logs", metrics: "metrics" },
  transport,
});
```

## Next.js helpers (`@o3osatoshi/logging/nextjs`)

Requires Next.js and React in the consuming app.
Client helpers (Web Vitals, `useLogger`) live in `@o3osatoshi/logging/nextjs/client`.

```ts
import {
  createNextjsOnRequestError,
  createNextjsRouteHandler,
  logNextjsMiddlewareRequest,
} from "@o3osatoshi/logging/nextjs";
import { createNextjsWebVitalsComponent } from "@o3osatoshi/logging/nextjs/client";
import { createBrowserLogger, initBrowserLogger } from "@o3osatoshi/logging/browser";
import { createNodeLogger, initNodeLogger } from "@o3osatoshi/logging/node";
import { NextResponse } from "next/server";

initNodeLogger({
  client: { token: process.env.AXIOM_API_TOKEN! },
  datasets: { logs: "logs", metrics: "metrics" },
  env: "production",
  service: "portfolio-web",
});

initBrowserLogger({
  client: { token: process.env.NEXT_PUBLIC_AXIOM_TOKEN! },
  datasets: { logs: "logs", metrics: "metrics" },
  env: "production",
  service: "portfolio-web",
});

const serverLogger = createNodeLogger();
const clientLogger = createBrowserLogger();
export const withAxiom = createNextjsRouteHandler(serverLogger);
export const onRequestError = createNextjsOnRequestError(serverLogger);
export const WebVitals = createNextjsWebVitalsComponent(clientLogger);

export const GET = withAxiom(async () => {
  return NextResponse.json({ ok: true });
});

export async function middleware(request: Request) {
  logNextjsMiddlewareRequest(serverLogger, request);
  return NextResponse.next();
}
```

Client components can use `createNextjsUseLogger` from
`@o3osatoshi/logging/nextjs/client`.
