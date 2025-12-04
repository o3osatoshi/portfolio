# Repository Guidelines (Current Implementation)

This document reflects the current state of the repository. Commands listed below come directly from existing `package.json` files, so please keep them in sync after making changes.

## Architecture Overview
- **Domain (`@repo/domain`)**: Value objects, entities, and ports. Only depends on `@o3osatoshi/toolkit`.
- **Application (`@repo/application`)**: DTO validation and use cases. Depends on the domain ports/value objects.
- **Infrastructure (`@repo/prisma`)**: Prisma-backed implementations of domain ports plus DB client utilities.
- **Delivery (`apps/web`, `apps/functions`)**: HTTP entry points that inject infrastructure adapters into application use cases.
- **Presentation (`@o3osatoshi/ui`, `apps/storybook`)**: Reusable UI library and documentation surface that stay free from domain concerns.
- **Shared Tooling (`@o3osatoshi/config`, `@o3osatoshi/toolkit`)**: Build presets, lint configs, and error-handling utilities consumed across the stack.

## Project Structure
- `apps/web`: Next.js 15 portfolio app (React 19, server actions, API routes).
- `apps/functions`: Firebase Cloud Functions bundled via `tsup` (Node 22 runtime).
- `apps/storybook`: Vite-powered Storybook for UI review and visual testing.
- `packages/domain`, `packages/application`: Clean architecture core (Vitest).
- `packages/prisma`: Prisma schema, adapters, and DB scripts.
- `packages/ui`: Published React component library with split server/client builds.
- `packages/toolkit`: Zod/Neverthrow helpers for consistent error handling.
- `packages/eth`: Wagmi CLI generated contract types/hooks (requires local `.env`).
- `packages/config`: Shared tsconfig/biome/eslint/tsup presets.
- `packages/supabase`: Supabase CLI configuration (not a workspace package).

## Setup & Root Scripts
- Install dependencies: `pnpm install` (requires Node >= 22).
- Start all dev targets: `pnpm dev`.
- Build all packages/apps: `pnpm build`.
- Type-check the workspace: `pnpm check:type`.
- Run all tests: `pnpm check:test`.
- Lint/format/package sorting: `pnpm style`.
- Clean build artifacts: `pnpm clean`.
- Update env files (runs only where `pull:env` script exists): `pnpm pull:env`.
- Deploy Firebase functions: `pnpm deploy:functions`.
- Deploy Edge (prod): `pnpm deploy:edge`.
- Deploy Edge (prv): `pnpm deploy:edge:prv`.

## Per-App / Package Commands
- Web: `pnpm dev:web`, `pnpm -C apps/web build`, `pnpm -C apps/web start`.
- Storybook: `pnpm dev:storybook`, `pnpm -C apps/storybook build`.
- Functions: `pnpm -C apps/functions dev`, `pnpm -C apps/functions serve`, `pnpm -C apps/functions deploy`.
- Edge: `pnpm -C apps/edge dev`, `pnpm -C apps/edge build`, `pnpm -C apps/edge deploy`, `pnpm -C apps/edge deploy:prv`.
- Prisma: `pnpm -C packages/prisma migrate:dev`, `pnpm -C packages/prisma migrate:deploy`, `pnpm -C packages/prisma db:push`, `pnpm -C packages/prisma seed`, `pnpm -C packages/prisma studio`.
- Eth codegen: `pnpm -C packages/eth generate` (requires `packages/eth/.env.local`).
- UI library: `pnpm -C packages/ui dev`, `pnpm -C packages/ui build`, `pnpm -C packages/ui test`.
- Toolkit/domain/application: `pnpm -C <package> test`, `pnpm -C <package> typecheck`.

## Code Generation
- Prisma client: `pnpm -C packages/prisma build`  
  - Turbo runs this script as part of `build` pipelines, so Prisma Client is generated automatically when building.
- Wagmi/ETH hooks: `pnpm -C packages/eth generate`.
- Run every available `generate` script: `pnpm -r run generate` (only executes where defined).

## Database (Prisma)
- Environment files:
  - `packages/prisma/.env` (used by Prisma CLI via `prisma.config.ts` + `dotenv/config`)
  - `packages/prisma/.env.development.local`, `.env.production.local` (local templates)
- Use the `packages/prisma` scripts for all schema/migration/seed tasks (see commands above). There are no root-level DB scripts.

## Testing
- Framework: Vitest with colocated `*.spec.ts(x)` tests.
- Workspace: `pnpm check:test` (Turbo fans out to package-level `test` scripts).
- Package scoped example: `pnpm -C packages/domain test`.
- Coverage: `pnpm -C <package> test:cvrg`.

## Coding Style & Conventions
- Run `pnpm style` to execute package sort + ESLint + Biome in sequence.
- Biome only: `pnpm style:biome` (write) or `pnpm style:biome:pure` (check).
- ESLint only: `pnpm style:eslint` (fix) or `pnpm style:eslint:pure` (cache-only).
- Imports are auto-organized via Biome + `eslint-plugin-perfectionist`.
- Strings: double quotes; indentation: spaces (Biome enforced).
- Naming: files = kebab-case, components = PascalCase, code symbols = camelCase.
- TypeScript preferred everywhere (Next.js routing conventions in `apps/web` and `packages/ui`).

## Security & Configuration
- Environment variables live in `.env.*` within consuming apps/packages.
  - `apps/web`: `.env.local` (Next.js).
  - `packages/prisma`: `.env.development.local` / `.env.production.local`.
  - `packages/eth`: `.env.local` for Wagmi CLI.
- Firebase CLI commands assume you are authenticated (`pnpm -C apps/functions deploy`, `pnpm -C apps/functions logs`).
- Minimum Node version is 22 for every workspace; `apps/functions` pins `engines.node` to `22`.

## Notes
- `packages/ui` publishes split server/client bundles; import `@o3osatoshi/ui/client` inside React client components.
- `packages/supabase` is configuration only and excluded from pnpm workspaces.
- Keep this document updated whenever scripts, package names, or architecture boundaries change.
