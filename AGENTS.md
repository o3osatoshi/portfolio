# Repository Guidelines (Current Implementation)

This document reflects the current, actual state of the repository. All commands listed are taken from the existing package.json files.

## Project Structure
- `apps/web`: Next.js 15 portfolio app.
- `apps/functions`: Firebase Cloud Functions (built with `tsup`, Node 22).
- `apps/storybook`: Storybook for UI review and documentation (Vite-based).
- `packages/ui`: Shared React UI components (separate server/client exports).
- `packages/domain`, `packages/application`: Domain and application layers (Vitest).
- `packages/prisma`: Prisma schema, client, and DB scripts.
- `packages/eth`: Contract types/hooks generated via Wagmi CLI.
- `packages/toolkit`: Utilities built around `zod`/`neverthrow`.
- `packages/config`: Shared tsconfig/biome/eslint/tsup presets.
- `packages/supabase`: Supabase config directory (not a workspace package).

## Setup, Build, Run
- Install: `pnpm install` (Node >= 22)
- Dev (all): `pnpm dev` (Turbo runs each package’s `dev`)
- Build (all): `pnpm build`

Per app/package (examples)
- Web: `pnpm dev:web` or `pnpm -C apps/web dev` (prod: `pnpm -C apps/web start`)
- Storybook: `pnpm dev:storybook` or `pnpm -C apps/storybook dev` (build: `pnpm -C apps/storybook build`)
- Functions: code watch `pnpm -C apps/functions dev` / emulator `pnpm -C apps/functions serve` (deploy: `pnpm deploy:functions`)

Code generation
- Prisma client: `pnpm -C packages/prisma generate`
- ETH codegen: `pnpm -C packages/eth generate` (requires `packages/eth/.env.local`)
- Run all generate scripts: `pnpm -r run generate` (runs in packages that define it)

## Database (Prisma)
All commands run under `packages/prisma`.
- Dev migrate: `pnpm -C packages/prisma migrate:dev`
- Deploy migrations: `pnpm -C packages/prisma migrate:deploy`
- Push schema (no migrations): `pnpm -C packages/prisma db:push`
- Seed: `pnpm -C packages/prisma seed`
- Status: `pnpm -C packages/prisma migrate:status`
- Studio: `pnpm -C packages/prisma studio`

Environment files: `packages/prisma/.env.development.local` and `.env.production.local` (loaded via `dotenv-cli`).

## Coding Style & Conventions
- Lint/format: `pnpm style` (runs `style:pkg`, `style:eslint`, and `style:biome`)
  - Biome only: `pnpm style:biome`
  - Biome aggressive fix: `pnpm style:biome:fix`
- Indentation: spaces; Strings: double quotes (Biome)
- Imports: auto-organized (Biome + perfectionist)
- Language: TypeScript preferred (Next.js file-based routing conventions in `apps/web` and `packages/ui`)
- Naming: files=kebab-case, components=PascalCase, variables/functions=camelCase

## Testing
- Framework: Vitest (co-located tests `*.test.ts(x)`)
- Run all: `pnpm -r run test` or `pnpm check:test`
- Per package example: `pnpm -C packages/domain vitest run`
- Prisma integration tests: `pnpm -C packages/prisma test:int` (uses Testcontainers; Docker required)

## Commit & PR Guidelines
- Commits: Conventional Commits with scopes
  - Examples: `feat(web): add project grid`
             `refactor(application-use-case): simplify actor flows`
             `fix(prisma): correct schema relation`
- PRs: clear summary, link issues, attach UI screenshots/GIFs, call out env/DB changes, ensure `pnpm build` and `pnpm style` pass.

## Security & Config
- Env vars: use `.env.*` files in `apps/web` and `packages/prisma` (never commit secrets)
  - `apps/web`: Next.js `.env.local`, etc.
  - `packages/prisma`: `.env.development.local` / `.env.production.local`
  - `packages/eth`: `.env.local` required for `wagmi generate`
- Firebase: deploy functions via `pnpm deploy:functions`; logs via `pnpm -C apps/functions logs`
- Node: >= 22 (note: `apps/functions` has `engines.node: 22`)

## Notes
- There are no root `db:*` or `generate` scripts. Run codegen/DB commands inside the respective packages (see above).
- `packages/ui` publishes separate server/client bundles. Use `@o3osatoshi/ui/client` from client components.
- `packages/supabase` is a configuration directory, not a workspace package.
