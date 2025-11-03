# @repo/interface — HTTP Interface Layer

This package provides the reusable HTTP interface (Hono app) for the portfolio, independent from any particular runtime. Delivery layers (Cloudflare Workers, Firebase Functions, etc.) import a runtime-specific entry that wires minimal dependencies and exports the same API surface.

## Key ideas
- Clean Architecture boundary: this package contains transport (HTTP) and minimal runtime wiring only; business logic lives in application/domain packages.
- Runtime adapters: `./http/edge` for Cloudflare Workers, `./http/node` for Node/Vercel/Firebase.
- Typed client: a small RPC client (via `hono/client`) for consumers to call the API with types.

## Public exports
Subpath exports are declared in `package.json`:

```ts
// Edge runtime (Cloudflare Workers)
import app from "@repo/interface/http/edge";

// Node runtime (Next.js API route, Vercel, etc.)
import { app, GET, POST } from "@repo/interface/http/node";

// Typed RPC client for browsers/servers
import { createInterfaceClient } from "@repo/interface/rpc-client";
```

## HTTP API
The app is mounted under `/api` and exposes:
- `GET /api/healthz` → `{ ok: true }`
- `GET /api/todos` → `Array<{ id: string; title: string }>`
- `POST /api/todos` with JSON `{ "title": string }` → `201 Created` and the created todo

Validation uses `zod` and `@hono/zod-validator`. Errors are normalized and serialized by the shared toolkit.

## How it’s structured
- `src/http/core/app.ts` — builds the Hono app with routes and middlewares.
- `src/http/core/middlewares.ts` — request id, structured logging.
- `src/http/edge/index.ts` — minimal `Deps` implementation for Edge runtimes.
- `src/http/node/{index.ts,deps.ts}` — Node runtime wiring and helpers.
- `src/http/node/adapter-firebase.ts` — adapter to expose the Hono app as a Firebase HTTPS function handler.
- `src/rpc-client/client.ts` — typed client creator bound to the app’s route types.

## Usage examples

Edge (Cloudflare Workers):
```ts
// apps/edge/src/index.ts
import app from "@repo/interface/http/edge";
export default app;
```

Firebase Functions (Node runtime):
```ts
// apps/functions/src/api.ts
import { createFirebaseHandler } from "@repo/interface/http/node/adapter-firebase";
import { app } from "@repo/interface/http/node";

export const api = createFirebaseHandler(app);
```

Typed client (browser/server):
```ts
import { createInterfaceClient } from "@repo/interface/rpc-client";

const client = createInterfaceClient("https://your-edge-domain.example");
const health = await client.api.healthz.$get();
const todos = await client.api.todos.$get();
const created = await client.api.todos.$post({ json: { title: "Buy milk" } });
```

## Development
Run a Node-based dev server for quick iteration:

```bash
pnpm -C packages/interface dev
# prints http://localhost:8787
```

Testing and types:

```bash
pnpm -C packages/interface test
pnpm -C packages/interface test:cvrg
pnpm -C packages/interface typecheck
```

## Extending the runtime dependencies
The HTTP app expects a small `Deps` object. Delivery layers can replace the in-memory demo implementation with real infrastructure (databases, external services):

```ts
import { buildApp, type Deps } from "@repo/interface/src/http/core/app";

const deps: Deps = {
  async createTodo(input) {
    const id = await myDb.insertTodo(input.title); // persist
    return { id, title: input.title };
  },
  async listTodos() {
    return myDb.listTodos();
  },
};

export const app = buildApp(deps);
```

This keeps transport concerns and domain/application logic decoupled while enabling different delivery targets to share the same API surface.

