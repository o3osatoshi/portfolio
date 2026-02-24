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
import { createRpcClient, createEdgeRpcClient } from "@repo/interface/rpc-client";
```

## HTTP API
ランタイムごとにベースパスを分離しています（用途の独立性を高めるため）。

- Node.js（Next.js API / Firebase Functions など）: ベースパス `/api`
  - `GET /api/public/healthz` → `{ ok: true }`
  - `GET /api/private/labs/transactions` → `Transaction[]`（認証済みユーザーとして実行）
  - `GET /api/cli/v1/me` → `{ userId, issuer, subject, scopes }`（CLI Bearer 認証）
  - `GET /api/cli/v1/transactions`
  - `POST /api/cli/v1/transactions`
  - `PATCH /api/cli/v1/transactions/:id`
  - `DELETE /api/cli/v1/transactions/:id`

- Edge（Cloudflare Workers / Next.js Edge）: ベースパス `/edge`
  - `GET /edge/public/healthz`
  - `GET /edge/private/me` → 認証済みユーザー情報

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
import { createAuthConfig } from "@repo/auth";
import { buildEdgeApp } from "@repo/interface/http/edge";
import { env } from "./env";

const authConfig = createAuthConfig({
  providers: {
    oidc: {
      clientId: env.AUTH_OIDC_CLIENT_ID,
      clientSecret: env.AUTH_OIDC_CLIENT_SECRET,
      issuer: env.AUTH_OIDC_ISSUER,
    },
  },
  secret: env.AUTH_SECRET,
});

export default buildEdgeApp({ authConfig });
```

Next.js (Vercel Edge):
```ts
// apps/web/src/app/api/[...route]/route.ts
export const runtime = "nodejs";
import { createAuthConfig } from "@repo/auth";
import { buildHandler } from "@repo/interface/http/node";
import { ExchangeRateApi } from "@repo/integrations";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";

const prisma = createPrismaClient({ connectionString: process.env.DATABASE_URL! });
const transactionRepo = new PrismaTransactionRepository(prisma);
const fxQuoteProvider = new ExchangeRateApi({
  apiKey: process.env.EXCHANGE_RATE_API_KEY!,
  baseUrl: process.env.EXCHANGE_RATE_BASE_URL!,
});
const authConfig = createAuthConfig({
  providers: {
    oidc: {
      clientId: process.env.AUTH_OIDC_CLIENT_ID!,
      clientSecret: process.env.AUTH_OIDC_CLIENT_SECRET!,
      issuer: process.env.AUTH_OIDC_ISSUER!,
    },
  },
  prismaClient: prisma,
  secret: process.env.AUTH_SECRET!,
});

export const { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } = buildHandler({
  authConfig,
  fxQuoteProvider,
  resolveAccessTokenPrincipal,
  transactionRepo,
});

// apps/web/src/app/edge/[...route]/route.ts
export const runtime = "edge";
import { createAuthConfig } from "@repo/auth";
import { buildEdgeHandler } from "@repo/interface/http/edge";

const authConfig = createAuthConfig({
  providers: {
    oidc: {
      clientId: process.env.AUTH_OIDC_CLIENT_ID!,
      clientSecret: process.env.AUTH_OIDC_CLIENT_SECRET!,
      issuer: process.env.AUTH_OIDC_ISSUER!,
    },
  },
  secret: process.env.AUTH_SECRET!,
});

export const { GET, POST } = buildEdgeHandler({ authConfig });
```

Firebase Functions (Node runtime):
```ts
// apps/functions/src/api.ts
import { onRequest } from "firebase-functions/v2/https";
import type { AuthConfig } from "@repo/auth";
import type { FxQuoteProvider } from "@repo/domain";
import { buildApp, createExpressRequestHandler } from "@repo/interface/http/node";
import { SomeTransactionRepository } from "@your/infra";

const app = buildApp({
  authConfig: {} as AuthConfig,
  fxQuoteProvider: {} as FxQuoteProvider,
  resolveAccessTokenPrincipal: () => {
    throw new Error("resolveAccessTokenPrincipal is required");
  },
  transactionRepo: new SomeTransactionRepository(),
});
export const api = onRequest(createExpressRequestHandler(app));
```

Typed client (browser/server):
```ts
import { createRpcClient, createEdgeRpcClient } from "@repo/interface/rpc-client";

// Node API at /api
const clientNode = createRpcClient("https://your-domain.example");
await clientNode.api.public.healthz.$get();

// Edge API at /edge
const clientEdge = createEdgeRpcClient("https://your-domain.example");
await clientEdge.edge.public.healthz.$get();

// With custom options (e.g. shared headers)
const clientWithHeaders = createRpcClient("https://your-domain.example", {
  headers: async () => ({
    Authorization: `Bearer ${await getToken()}`,
  }),
});
```

Testing and types:

```bash
pnpm -C packages/interface test
pnpm -C packages/interface test:cvrg
pnpm -C packages/interface typecheck
```

## Extending the runtime dependencies
The Node HTTP app expects a small `Deps` object. Delivery layers should inject an Auth.js config, CLI principal resolver, and a `TransactionRepository` (from `@repo/domain`):

```ts
import { createAuthConfig } from "@repo/auth";
import { buildApp, type Deps } from "@repo/interface/http/node/app";
import type { TransactionRepository } from "@repo/domain";

const deps: Deps = {
  authConfig: createAuthConfig({
    providers: {
      oidc: {
        clientId: "...",
        clientSecret: "...",
        issuer: "https://example.auth0.com",
      },
    },
    secret: "...",
  }),
  resolveAccessTokenPrincipal: () => {
    throw new Error(
      "inject from @repo/auth#createAccessTokenPrincipalResolver",
    );
  },
  transactionRepo: myTransactionRepo as TransactionRepository,
};

export const app = buildApp(deps);
```

This keeps transport concerns and domain/application logic decoupled while enabling different delivery targets to share the same API surface.

## Quality

- Tests: `pnpm -C packages/interface test` / `pnpm -C packages/interface test:cvrg`
- Coverage: [![Coverage: @repo/interface](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=interface)](https://app.codecov.io/github/o3osatoshi/portfolio?component=interface)
