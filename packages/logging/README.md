# @o3osatoshi/logging

Axiom‑first logging helpers for Node, Edge, and browser runtimes.

Focus:
- Small surface area with consistent fields across runtimes
- Logs + metrics separated into dedicated Axiom datasets
- Trace context fields (`trace_id`, `span_id`) aligned with OpenTelemetry naming

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
  axiom: {
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
  axiom: { token: env.AXIOM_API_TOKEN },
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
  axiom: { token: window.ENV.AXIOM_API_TOKEN },
  datasets: { logs: "logs", metrics: "metrics" },
  env: "production",
  service: "portfolio-web",
});

const log = createBrowserLogger();
log.event("page_view", { path: window.location.pathname });
```
