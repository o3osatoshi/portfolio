[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @repo/auth

# @repo/auth

Hono + Auth.js configuration and helpers for the monorepo. This package exposes a factory to compose runtime auth configuration (optionally with PrismaAdapter), provides Edge/Node middleware re-exports, and thin React helpers for client usage.

## Goals
- Decouple auth setup/logic from apps and make it reusable.
- Keep Prisma-backed DB usage opt-in via configuration.
- Centralize Auth.js setup so apps import only `@repo/auth` entries.

## Requirements
- Node: `>=22`
- Dependencies:
  - `@hono/auth-js`
  - `@auth/core`
  - `@auth/prisma-adapter` (only if you supply a Prisma client)
- Environment variables (runtime for apps):
  - `AUTH_SECRET`
  - `AUTH_GOOGLE_ID`
  - `AUTH_GOOGLE_SECRET`

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
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";

const prisma = createPrismaClient({ connectionString: process.env.DATABASE_URL! });
const transactionRepo = new PrismaTransactionRepository(prisma);

const authConfig = createAuthConfig({
  providers: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },
  prismaClient: prisma,
  secret: process.env.AUTH_SECRET!,
});

export const { GET, POST } = buildHandler({ authConfig, transactionRepo });
```

Edge route:

```ts
// apps/web/src/app/edge/[...route]/route.ts
import { createAuthConfig } from "@repo/auth";
import { buildEdgeHandler } from "@repo/interface/http/edge";

export const runtime = "edge";

const authConfig = createAuthConfig({
  providers: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
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
  if (!user) return <button onClick={() => signIn("google", { redirectTo: "/" })}>Sign in</button>;
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

## Interfaces

- [AuthConfig](interfaces/AuthConfig.md)

## Type Aliases

- [AdapterUser](type-aliases/AdapterUser.md)
- [AuthProviderId](type-aliases/AuthProviderId.md)
- [AuthUser](type-aliases/AuthUser.md)
- [CreateAuthConfigOptions](type-aliases/CreateAuthConfigOptions.md)
- [ISODateString](type-aliases/ISODateString.md)
- [JWT](type-aliases/JWT.md)
- [Session](type-aliases/Session.md)
- [SignInOptions](type-aliases/SignInOptions.md)
- [SignOutOptions](type-aliases/SignOutOptions.md)
- [User](type-aliases/User.md)

## Variables

- [adapterUserSchema](variables/adapterUserSchema.md)
- [authProviderIdSchema](variables/authProviderIdSchema.md)
- [authUserSchema](variables/authUserSchema.md)
- [isoDateStringSchema](variables/isoDateStringSchema.md)
- [jwtSchema](variables/jwtSchema.md)
- [sessionSchema](variables/sessionSchema.md)
- [signInOptionsSchema](variables/signInOptionsSchema.md)
- [signOutOptionsSchema](variables/signOutOptionsSchema.md)
- [userSchema](variables/userSchema.md)

## Functions

- [createAuthConfig](functions/createAuthConfig.md)
