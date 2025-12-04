# @repo/prisma (internal)

Internal Prisma layer used by apps in this monorepo. It follows a source‑first model: apps import `src/*.ts` directly.

## Overview
- Purpose: Provide DB access via Prisma Client and error shaping helpers (e.g., `newPrismaError`).
- Format: Source‑first (no build artifacts; apps read from `./src`).
- Exports: `package.json` maps `"."` to `"./src/index.ts"`.

## Usage (in apps)
1) Next.js configuration (apps/web example)

```ts
// apps/web/next.config.mjs
export default {
  transpilePackages: [
    "@o3osatoshi/ui",
    "@repo/prisma",
    "@repo/application",
    "@repo/domain",
  ],
  // Add Prisma-related optimizations/plugins here if needed
};
```

2) Import

```ts
import { createPrismaClient } from "@repo/prisma";
const prisma = createPrismaClient({ connectionString: process.env.DATABASE_URL! });
```

## Prisma Setup
- Environment files:
  - Main: `packages/prisma/.env` (loaded by Prisma CLI via `prisma.config.ts` + `dotenv/config`)
  - Local templates: `packages/prisma/.env.development.local` / `.env.production.local`
- Client generation:
  - The Turbo `build` pipeline runs `pnpm -C packages/prisma build`, which calls `prisma generate` automatically.
  - For local use, prefer `pnpm -C packages/prisma build` so behavior matches CI and deployment.

## Scripts
- `pnpm -C packages/prisma build` — Generate Prisma Client (also used by Turbo `build`)
- `pnpm -C packages/prisma db:push` — Push schema to DB (dev)
- `pnpm -C packages/prisma migrate:dev` — Create/apply migrations (dev)
- `pnpm -C packages/prisma migrate:deploy` — Apply migrations to production
- `pnpm -C packages/prisma studio` — Open Prisma Studio
- `pnpm -C packages/prisma typecheck` — Typecheck only

## Notes
- Do not bundle Prisma Client: it’s generated at runtime; keeping source‑first is the safest approach.
- Import from the root export: apps should import from `@repo/prisma` (mapped to `./src/index.ts`).
- Next integration: include `@repo/prisma` in `transpilePackages` so apps transpile TypeScript from this package.

## Testing
- Unit tests: `pnpm -C packages/prisma test:run` (excludes `**/*.int.spec.ts` by default)
- Integration tests: `pnpm -C packages/prisma test:run:int` (uses Testcontainers to run a DB)

## Quality

- Tests: `pnpm -C packages/prisma test` / `pnpm -C packages/prisma test:cvrg`
- Coverage: [![Coverage: @repo/prisma](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=prisma)](https://app.codecov.io/github/o3osatoshi/portfolio?component=prisma)

## Troubleshooting
- “Prisma Client not found”
  - Run `pnpm -C packages/prisma build` and rebuild the app.
- “TypeScript modules not resolved in apps”
  - Ensure Next `transpilePackages` includes `@repo/prisma`.
