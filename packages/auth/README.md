# @repo/auth

Shared NextAuth v5 (beta) configuration and helpers for the monorepo. This package exposes a factory to compose Node runtime auth (PrismaAdapter) in the app, provides an Edge‑safe middleware entry, and thin React helpers for client usage.

## Goals
- Decouple auth setup/logic from `apps/web` and make it reusable.
- Keep Prisma‑backed Node auth and Edge middleware clearly separated.
- Centralize NextAuth dependency so apps only import `@repo/auth`.

## Requirements
- Node: `>=22`
- Dependencies:
  - `next-auth@5.0.0-beta.27`
  - `@auth/prisma-adapter@^2.10.0`
  - `@repo/prisma` (provides Prisma Client)
- Environment variables (runtime for `apps/web`):
  - `AUTH_SECRET`
  - `AUTH_GOOGLE_ID`
  - `AUTH_GOOGLE_SECRET`
  - `DATABASE_URL`

Notes:
- Next.js loads runtime envs from `apps/web/.env.local`.
- Prisma CLI scripts read from `packages/prisma/.env.*.local` via `dotenv-cli`. At runtime, `DATABASE_URL` must still be available to the Next.js server (e.g., in `apps/web/.env.local`).

## Exports
- `@repo/auth`
  - `createAuth(options)`: Factory that composes NextAuth with PrismaAdapter.
    - `options`: `{ prisma: PrismaClient } | { connectionString: string }`
    - Returns: `{ handlers, auth, getUserId }`
- `@repo/auth/middleware`
  - `middleware`: Edge‑compatible middleware using the shared config.
- `@repo/auth/react`
  - `AuthProvider`, `useUser`, `signIn`, `signOut`.

The internal shared config lives at `src/config.ts` and is not exported as a public entrypoint.

## Usage (Next.js 15, App Router)

App wiring (Node, once at startup):

```ts
// apps/web/src/lib/auth.ts
import { createAuth } from "@repo/auth";
import { createPrismaClient } from "@repo/prisma";
import { env } from "@/env/server";

const prisma = createPrismaClient({ connectionString: env.DATABASE_URL });
export const { handlers, auth, getUserId } = createAuth({ prisma });
```

API route (`apps/web/src/app/api/auth/[...nextauth]/route.ts`):

```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

Middleware (`apps/web/src/middleware.ts`):

```ts
export { middleware } from "@repo/auth/middleware";
```

Server actions / server components:

```ts
import { getUserId } from "@/lib/auth";

const userId = await getUserId();
```

Client code should use `@repo/auth/react` abstractions:

```tsx
import { AuthProvider, useUser, signIn, signOut } from "@repo/auth/react";
```

Example:

```tsx
function App({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function Menu() {
  const user = useUser();
  if (!user) return <button onClick={() => signIn("google", { redirectTo: "/" })}>Sign in</button>;
  return <button onClick={() => signOut()}>Sign out</button>;
}
```

This removes direct `next-auth` imports from apps while centralizing the dependency in `@repo/auth`.

## Type Augmentation (Session.user.id)
This package declares a module augmentation for `Session['user'].id?: string` in `src/next-auth.d.ts`.
If the app needs stricter typing locally, you can add an equivalent declaration in the app too:

```ts
// apps/web/src/types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & { id?: string };
  }
}
```

## Tests
Unit tests (Vitest) cover the pure callback logic in `authConfig`.

- Run: `pnpm -C packages/auth test`
- Coverage: `pnpm -C packages/auth test:cvrg`

## Implementation Notes
- Node runtime factory (PrismaAdapter): `src/index.ts`
- Edge runtime (no DB access): `src/middleware.ts`
- Shared configuration (providers/callbacks): `src/config.ts`

Extend providers, callbacks, or add client re‑exports here as needed.
