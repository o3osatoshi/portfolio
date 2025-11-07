# @repo/interface — HTTP Interface Layer

This package provides the reusable HTTP interface (Hono app) for the portfolio, independent from any particular runtime. Delivery layers (Cloudflare Workers, Firebase Functions, etc.) import a runtime-specific entry that wires minimal dependencies and exports the same API surface.

## Key ideas
- Clean Architecture boundary: this package contains transport (HTTP) and minimal runtime wiring only; business logic lives in application/domain packages.
- Runtime adapters: `./http/edge` for Cloudflare Workers, `./http/node` for Node/Vercel/Firebase.
- Typed client: a small RPC client (via `hono/client`) for consumers to call the API with types.

## Public exports
Subpath exports are declared in `package.json`:

```ts
// Edge runtime (Cloudflare Workers / Next.js Edge)
import app from "@repo/interface/http/edge"; // Cloudflare Workers default export
import { GET, POST } from "@repo/interface/http/edge"; // Next.js Edge handlers

// Node runtime (Next.js API route, Vercel, etc.)
import { app, GET, POST } from "@repo/interface/http/node";

// Typed RPC client for browsers/servers
import { createInterfaceClient, createInterfaceClientEdge } from "@repo/interface/rpc-client";
```

## HTTP API
ランタイムごとにベースパスを分離しています（用途の独立性を高めるため）。

- Node.js（Next.js API / Firebase Functions など）: ベースパス `/api`
  - `GET /api/healthz` → `{ ok: true }`
  - `GET /api/todos` → `Array<{ id: string; title: string }>`
  - `POST /api/todos` with JSON `{ "title": string }` → `201 Created`

- Edge（Cloudflare Workers / Next.js Edge）: ベースパス `/edge`
  - `GET /edge/healthz`
  - `GET /edge/todos`
  - `POST /edge/todos`

Validation uses `zod` and `@hono/zod-validator`. Errors are normalized and serialized by the shared toolkit.

## How it’s structured
- `src/http/core/{dto.ts,errors.ts,middlewares.ts}` — shared primitives.
- `src/http/node/app.ts` — Node 用ビルダー（basePath: `/api`）。
- `src/http/node/{index.ts,deps.ts}` — Node ランタイム配線と依存。
- `src/http/node/adapter-express.ts` — Express 互換アダプタ（Firebase Functions などの Node ランタイムで使用）。
- `src/http/edge/app.ts` — Edge 用ビルダー（basePath: `/edge`）。
- `src/http/edge/deps.ts` — Edge ランタイム依存の生成。
- `src/http/edge/index.ts` — Edge ランタイム配線。
- `src/rpc-client/client.ts` — Node/Edge 向けの型付きクライアント作成関数。

## Usage examples

Edge (Cloudflare Workers):
```ts
// apps/edge/src/index.ts
import app from "@repo/interface/http/edge";
export default app;
```

Next.js (Vercel Edge):
```ts
// apps/web/src/app/api/[...route]/route.ts
export const runtime = "nodejs";
export { GET, POST } from "@repo/interface/http/node";

// apps/web/src/app/edge/[...route]/route.ts
export const runtime = "edge";
export { GET, POST } from "@repo/interface/http/edge";
```

Firebase Functions (Node runtime):
```ts
// apps/functions/src/api.ts
import { onRequest } from "firebase-functions/v2/https";
import { app, createExpressRequestHandler } from "@repo/interface/http/node";

export const api = onRequest(createExpressRequestHandler(app));
```

Typed client (browser/server):
```ts
import { createInterfaceClient, createInterfaceClientEdge } from "@repo/interface/rpc-client";

// Node API at /api
const clientNode = createInterfaceClient("https://your-domain.example");
await clientNode.api.healthz.$get();

// Edge API at /edge
const clientEdge = createInterfaceClientEdge("https://your-domain.example");
await clientEdge.edge.healthz.$get();
```

Testing and types:

```bash
pnpm -C packages/interface test
pnpm -C packages/interface test:cvrg
pnpm -C packages/interface typecheck
```

## Extending the runtime dependencies
The HTTP app expects a small `Deps` object. Delivery layers should inject real infrastructure-backed implementations (databases, external services):

```ts
import { buildApp, type Deps } from "@repo/interface/src/http/node/app";

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
