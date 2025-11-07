# @repo/interface — HTTP Interface Layer

This package provides the reusable HTTP interface (Hono app) for the portfolio, independent from any particular runtime. Delivery layers (Cloudflare Workers, Firebase Functions, etc.) import a runtime-specific entry that wires minimal dependencies and exports the same API surface.

## Key ideas
- Clean Architecture boundary: this package contains transport (HTTP) and minimal runtime wiring only; business logic lives in application/domain packages.
- Runtime adapters: `./http/edge` for Cloudflare Workers, `./http/node` for Node/Vercel/Firebase.
- Typed client: a small RPC client (via `hono/client`) for consumers to call the API with types.

## Public exports
Subpath exports are declared in `package.json`:

```ts
// Node runtime (Next.js API route, Vercel, Firebase)
import { buildApp, buildHandler, createExpressRequestHandler } from "@repo/interface/http/node";

// Edge runtime (Cloudflare Workers / Next.js Edge)
import { buildEdgeApp, buildEdgeHandler } from "@repo/interface/http/edge";

// Typed RPC client for browsers/servers
import { createInterfaceClient, createInterfaceClientEdge } from "@repo/interface/rpc-client";
```

## HTTP API
ランタイムごとにベースパスを分離しています（用途の独立性を高めるため）。

- Node.js（Next.js API / Firebase Functions など）: ベースパス `/api`
  - `GET /api/healthz` → `{ ok: true }`
  - `GET /api/labs/transactions?userId=<id>` → `Transaction[]`

- Edge（Cloudflare Workers / Next.js Edge）: ベースパス `/edge`
  - `GET /edge/healthz`

Validation uses `zod` and `@hono/zod-validator`. Errors are normalized and serialized by the shared toolkit.

## How it’s structured
- `src/http/core/{dto.ts,errors.ts,middlewares.ts}` — shared primitives (DTOs are examples and not wired to current routes).
- `src/http/node/app.ts` — Node 用ビルダー（basePath: `/api`）。
- `src/http/node/index.ts` — Node ランタイム配線（`buildHandler` を提供）。
- `src/http/node/adapter-express.ts` — Express 互換アダプタ（Firebase Functions などの Node ランタイムで使用）。
- `src/http/edge/app.ts` — Edge 用ビルダー（basePath: `/edge`）。
- `src/http/edge/index.ts` — Edge ランタイム配線（`buildEdgeHandler` を提供）。
- `src/rpc-client/client.ts` — Node/Edge 向けの型付きクライアント作成関数。

## Usage examples

Edge (Cloudflare Workers):
```ts
// apps/edge/src/index.ts
import { buildEdgeApp } from "@repo/interface/http/edge";
export default buildEdgeApp({});
```

Next.js (Vercel Edge):
```ts
// apps/web/src/app/api/[...route]/route.ts
export const runtime = "nodejs";
import { buildHandler } from "@repo/interface/http/node";
import { PrismaTransactionRepository } from "@repo/prisma";
export const { GET, POST } = buildHandler({
  transactionRepo: new PrismaTransactionRepository(),
});

// apps/web/src/app/edge/[...route]/route.ts
export const runtime = "edge";
import { buildEdgeHandler } from "@repo/interface/http/edge";
export const { GET, POST } = buildEdgeHandler({});
```

Firebase Functions (Node runtime):
```ts
// apps/functions/src/api.ts
import { onRequest } from "firebase-functions/v2/https";
import { buildApp, createExpressRequestHandler } from "@repo/interface/http/node";
import { SomeTransactionRepository } from "@your/infra";

const app = buildApp({ transactionRepo: new SomeTransactionRepository() });
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
The Node HTTP app expects a small `Deps` object. Delivery layers should inject an implementation of `TransactionRepository` (from `@repo/domain`):

```ts
import { buildApp, type Deps } from "@repo/interface/http/node/app";
import type { TransactionRepository } from "@repo/domain";

const deps: Deps = {
  transactionRepo: myTransactionRepo as TransactionRepository,
};

export const app = buildApp(deps);
```

This keeps transport concerns and domain/application logic decoupled while enabling different delivery targets to share the same API surface.
