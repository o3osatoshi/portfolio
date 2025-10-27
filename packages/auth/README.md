# @repo/auth

Shared NextAuth v5 (beta) configuration and server helpers for the monorepo. This package separates the Node runtime auth (with PrismaAdapter) from an Edge‑safe middleware entry.

## Goals
- Decouple auth setup/logic from `apps/web` and make it reusable.
- Keep Prisma‑backed Node auth and Edge middleware clearly separated.
- Allow apps to consume NextAuth by importing `@repo/auth`.

## Requirements
- Node: `>=22`
- peerDependencies:
  - `next-auth@5.0.0-beta.27`
  - `@auth/prisma-adapter@^2.10.0`
- dependencies:
  - `@repo/prisma` (provides Prisma Client)
- Environment variables (set in the consuming app’s `.env.*`):
  - `AUTH_SECRET`
  - `AUTH_GOOGLE_ID`
  - `AUTH_GOOGLE_SECRET`
  - `DATABASE_URL`

## Exports
- Root: `@repo/auth`
  - `auth`: server helper to get the current session (`await auth()`).
  - `handlers`: NextAuth API route handlers (`GET`, `POST`).
- Middleware: `@repo/auth/middleware`
  - `middleware`: Edge‑compatible middleware using the shared config.
- Config: `@repo/auth/config`
  - `authConfig`: shared provider/callback configuration (Edge‑safe, no DB access).

## Usage (Next.js 15, App Router)

API route (`apps/web/src/app/api/auth/[...nextauth]/route.ts`):

```ts
import { handlers } from "@repo/auth";
export const { GET, POST } = handlers;
```

Middleware (`apps/web/src/middleware.ts`):

```ts
export { middleware } from "@repo/auth/middleware";
```

Server actions/server components:

```ts
import { auth } from "@repo/auth";

const session = await auth();
const userId = session?.user?.id;
```

Client code should continue to import from `next-auth/react` directly:

```tsx
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
```

If desired, we can add a `@repo/auth/client` re‑export in the future.

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
- Node runtime (PrismaAdapter): `src/index.ts`
- Edge runtime (no DB access): `src/middleware.ts`
- Shared configuration (providers/callbacks): `src/config.ts`

Extend providers, callbacks, or add client re‑exports here as needed.
