# @repo/auth

Hono + Auth.js configuration and helpers for the monorepo. This package exposes a factory to compose runtime auth configuration (optionally with PrismaAdapter), provides Edge/Node middleware re-exports, and thin React helpers for client usage.

## Goals
- Decouple auth setup/logic from apps and make it reusable.
- Keep Prisma-backed DB usage opt-in via configuration.
- Centralize Auth.js setup so apps import only `@repo/auth` entries.

## Requirements
- Node: `22.x`
- Dependencies:
  - `@hono/auth-js`
  - `@auth/core`
  - `@auth/prisma-adapter` (only if you supply a Prisma client)
- Environment variables (runtime for apps):
  - `AUTH_OIDC_AUDIENCE` (required when enabling CLI Bearer token auth)
  - `AUTH_SECRET`
  - `AUTH_OIDC_CLIENT_ID`
  - `AUTH_OIDC_CLIENT_SECRET`
  - `AUTH_OIDC_ISSUER`

Notes:
- Next.js loads runtime envs from `apps/web/.env.local`.
- If you enable Prisma, ensure your app provides a client (e.g., via `@repo/prisma`).

## Exports
- `@repo/auth`
  - `createAuthConfig(options)`: Compose Auth.js config for Hono.
    - `options`: `{ providers, secret, basePath?, prismaClient?, session? }`
    - Returns: `AuthConfig`
- `@repo/auth/middleware`
  - Re-exports `initAuthConfig`, `authHandler`, `verifyAuth` from `@hono/auth-js`.
- `@repo/auth/react`
  - `AuthProvider`, `useUser`, `getUserId`, `signIn`, `signOut`.

## Usage (Next.js 15, App Router)

Node API route:

```ts
// apps/web/src/app/api/[...route]/route.ts
import { createAuthConfig } from "@repo/auth";
import { buildHandler } from "@repo/interface/http/node";
import { ExchangeRateApi } from "@repo/integrations";
import { createPrismaClient, PrismaTransactionRepository, PrismaUserIdentityStore } from "@repo/prisma";
import { createCliPrincipalResolver } from "@repo/auth";

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
const userIdentityStore = new PrismaUserIdentityStore(prisma);
const resolveCliPrincipal = createCliPrincipalResolver({
  audience: process.env.AUTH_OIDC_AUDIENCE!,
  findUserIdByIdentity: (input) => userIdentityStore.findUserIdByIssuerSubject(input),
  issuer: process.env.AUTH_OIDC_ISSUER!,
  resolveUserIdByIdentity: (input) => userIdentityStore.resolveUserId(input),
});

export const { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } = buildHandler({
  authConfig,
  fxQuoteProvider,
  resolveCliPrincipal,
  transactionRepo,
});
```

Edge route:

```ts
// apps/web/src/app/edge/[...route]/route.ts
import { createAuthConfig } from "@repo/auth";
import { buildEdgeHandler } from "@repo/interface/http/edge";

export const runtime = "edge";

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

Client code:

```tsx
import { AuthProvider, useUser, signIn, signOut } from "@repo/auth/react";

function App({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function Menu() {
  const user = useUser();
  if (!user) return <button onClick={() => signIn("oidc", { redirectTo: "/" })}>Sign in</button>;
  return <button onClick={() => signOut()}>Sign out</button>;
}
```

## Tests
Unit tests (Vitest) cover the auth config and React shims.

- Run: `pnpm -C packages/auth test`
- Coverage: `pnpm -C packages/auth test:cvrg`

## Implementation Notes
- Hono + Auth.js configuration: `src/hono-auth/*`
- Middleware re-exports: `src/hono-auth/middleware.ts` (public at `@repo/auth/middleware`)
- React shims for `@hono/auth-js`: `src/hono-auth/react.ts` (public at `@repo/auth/react`)

The legacy NextAuth integration remains in `src/next-auth/*` for experimentation but is not part of the public exports.

## Quality

- Tests: `pnpm -C packages/auth test` / `pnpm -C packages/auth test:cvrg`
- Coverage: [![Coverage: @repo/auth](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=auth)](https://app.codecov.io/github/o3osatoshi/portfolio?component=auth)
