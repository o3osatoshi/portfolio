```
        _____                  __             __    _ 
  ____ |__  /____  _________ _/ /_____  _____/ /_  (_)
 / __ \ /_ </ __ \/ ___/ __ `/ __/ __ \/ ___/ __ \/ / 
/ /_/ /__/ / /_/ (__  ) /_/ / /_/ /_/ (__  ) / / / /  
\____/____/\____/____/\__,_/\__/\____/____/_/ /_/_/   

                      __  ____      ___     
    ____  ____  _____/ /_/ __/___  / (_)___ 
   / __ \/ __ \/ ___/ __/ /_/ __ \/ / / __ \
  / /_/ / /_/ / /  / /_/ __/ /_/ / / / /_/ /
 / .___/\____/_/   \__/_/  \____/_/_/\____/ 
/_/                                         
```

# o3osatoshi portfolio

[![CI](https://github.com/o3osatoshi/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/o3osatoshi/portfolio/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg)](https://app.codecov.io/github/o3osatoshi/portfolio)

Personal portfolio and experimentation platform for **Satoshi Ogura**. The codebase demonstrates clean architecture layering, modular React UI, and modern tooling across web, serverless, and blockchain integrations.

- 🌐 **Live site**: [https://o3osatoshi.engr.work](https://o3osatoshi.engr.work)
- 📝 **Technical notes**: [https://blog.o3osatoshi.engr.work/archives/#tag-coding](https://blog.o3osatoshi.engr.work/archives/#tag-coding)

## Purpose
- **Self introduction**: Showcase experience in full-stack engineering, developer tooling, and Web3.
- **Technical lab**: Trial latest Next.js releases, clean architecture patterns, and contract integrations in a real project.

## Architecture at a Glance

### Clean architecture layers
- **Domain (`@repo/domain`)** – Entities, value objects, and repository ports implemented with `neverthrow`.
- **Application (`@repo/application`)** – DTO validation (Zod + toolkit) and use cases that depend only on domain ports.
- **Infrastructure (`@repo/prisma`)** – Prisma-based adapters that fulfill domain ports and expose a shared client.
- **Integrations (`@repo/integrations`)** – External service adapters (APIs, caches) implementing domain ports.
- **Logging (`@o3osatoshi/logging`)** – Axiom-first logging helpers for Node/Edge/Browser runtimes.
- **Auth (`@repo/auth`)** – Shared Auth.js/Hono configuration and React helpers consumed by HTTP interface and delivery layers.
- **HTTP Interface (`@repo/interface`)** – Hono-based HTTP interface and typed client for Node/Edge runtimes; wires auth + use cases, but owns no business logic.
- **Delivery (`apps/web`, `apps/functions`, `apps/edge`)** – Next.js route handlers, Firebase Functions, and a Cloudflare Worker that inject infrastructure adapters into application use cases.
- **Presentation (`@o3osatoshi/ui`, `apps/storybook`)** – Published UI library and Storybook documentation without domain coupling.
- **Shared tooling (`@o3osatoshi/config`, `@o3osatoshi/toolkit`)** – Build presets, lint configs, and error utilities consumed everywhere.

### Monorepo layout
```
⏺ root/
  ├── 📁 apps/
  │   ├── 📁 web/              # Next.js 15 portfolio app (React 19, App Router)
  │   ├── 📁 edge/             # Cloudflare Worker (Wrangler) exposing the Edge HTTP API
  │   ├── 📁 functions/        # Firebase Cloud Functions delivery layer
  │   └── 📁 storybook/        # Vite Storybook for @o3osatoshi/ui
  ├── 📁 packages/
  │   ├── 📁 domain/           # Core entities, value objects, ports
  │   ├── 📁 application/      # DTOs + use cases orchestrating domain logic
  │   ├── 📁 prisma/           # Prisma schema, adapters, and DB utilities
  │   ├── 📁 integrations/     # External adapters and HTTP utilities
  │   ├── 📁 auth/             # Auth.js + Hono glue (config, middleware, React helpers)
  │   ├── 📁 interface/        # HTTP interface (Hono app + typed RPC client for Node/Edge)
  │   ├── 📁 logging/          # Axiom-first logging helpers
  │   ├── 📁 ui/               # Shared React component library (server/client splits)
  │   ├── 📁 toolkit/          # Zod/Neverthrow helpers and error builders
  │   ├── 📁 config/           # Shared tsconfig, Biome, ESLint, tsup presets
  │   ├── 📁 eth/              # Wagmi CLI generated contract types & hooks
  │   └── 📁 supabase/         # Supabase CLI config (non-workspace)
  ├── 📄 package.json          # Turborepo + workspace scripts
  ├── 📄 turbo.json            # Task graph / caching strategy
  ├── 📄 pnpm-workspace.yaml   # Workspace + dependency catalog
  └── 📄 AGENTS.md             # Working guidelines (keep in sync!)
```

## Tooling & Scripts

### Prerequisites
- Node.js **>= 22**
- pnpm **>= 10** (workspace-aware)
- Docker (for Prisma Testcontainers flows)

### Setup
```bash
git clone https://github.com/o3osatoshi/portfolio.git
cd portfolio
pnpm install
```

### Workspace commands
- `pnpm dev` – Run all dev targets via Turbo (web, Storybook, functions watch, etc.).
- `pnpm build` – Build every package/app respecting task dependencies.
- `pnpm check` – Run type-checks and tests (`check:type` + `check:test`).
- `pnpm check:type` – Workspace-wide TypeScript compilation with `noEmit`.
- `pnpm check:test` / `pnpm check:test:cvrg` – Execute package `test` scripts (Vitest) with optional coverage.
- `pnpm style` – Package sort → ESLint (fix) → Biome (write).
- `pnpm clean` – Remove build artifacts across packages.
- `pnpm env:pull` – Run `env:pull` scripts only in packages/apps that define them (updates local `.env*` files).
- Docs: To update API docs, run `npx typedoc`.
- `pnpm deploy:functions` – Deploy Firebase Cloud Functions.
- `pnpm api:extract` / `pnpm api:report` – Run API extractor across publishable libraries.

### App and package targets
- Web app: `pnpm dev:web`, `pnpm -C apps/web build`, `pnpm -C apps/web start`.
- Storybook: `pnpm dev:storybook`, `pnpm -C apps/storybook build`.
- Firebase functions: `pnpm -C apps/functions dev`, `pnpm -C apps/functions serve`, `pnpm -C apps/functions deploy`.
- Edge Worker: `pnpm dev:edge`, `pnpm build:edge`, `pnpm deploy:edge`, `pnpm deploy:edge:prv`.
- UI library: `pnpm -C packages/ui dev`, `pnpm -C packages/ui build`, `pnpm -C packages/ui test`.
- Domain/Application/Toolkit: `pnpm -C packages/<name> test`, `pnpm -C packages/<name> typecheck`.

## Database workflow (Prisma)
- Development migrate: `pnpm -C packages/prisma migrate:dev`
- Reset database (dev): `pnpm -C packages/prisma migrate:reset`
- Production deploy: `pnpm -C packages/prisma migrate:deploy`
- Push schema without migrations: `pnpm -C packages/prisma db:push`
- Seed data: `pnpm -C packages/prisma db:seed`
- Inspect status: `pnpm -C packages/prisma migrate:status`
- Prisma Studio: `pnpm -C packages/prisma studio`

Environment files (Prisma):
- `packages/prisma/.env` (used by Prisma CLI via `prisma.config.ts` + `dotenv/config`)
- `packages/prisma/.env.development.local`
- `packages/prisma/.env.production.local`

Typically, you use the values from the `*.local` files (for example, fetched via Doppler) as a template, then copy or merge the desired configuration into `packages/prisma/.env` before running Prisma CLI commands (at minimum, `DATABASE_URL` must be set).

**Database providers:**
- **Production/Development**: Neon PostgreSQL (managed via Doppler secrets)
- **Local development with Docker**: `postgresql://postgres:postgres@localhost:54329/postgres?schema=public`

## Code generation
- Prisma client:
  - Local/Manual: `pnpm -C packages/prisma build`
  - Via Turbo: the `build` pipeline runs `pnpm -C packages/prisma build` as a dependency, which executes `prisma generate`.
- Wagmi/ETH hooks (requires `packages/eth/.env.local`): `pnpm -C packages/eth generate`
- Run every declared `generate` script: `pnpm -r run generate`

## Testing & Quality

- Primary framework: **Vitest** with colocated `*.spec.ts(x)` files.
- CI (`.github/workflows/ci.yml`) runs `pnpm check:test:cvrg` on each push/PR and uploads JUnit + coverage reports to Codecov (see CI/Coverage badges at the top of this README).
- Coverage is tracked with Codecov, including per-package components and flags; see `docs/quality/README.md` for detailed tables and SVG graphs.
- Quick commands:
  - Workspace tests: `pnpm check:test` / `pnpm check:test:cvrg`
  - Package tests: `pnpm -C packages/<name> test` / `pnpm -C packages/<name> test:cvrg`

## Technology stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, App Router.
- **Backend**: Hono-based HTTP interface delivered via Next.js route handlers, Firebase Functions (Node 22), and a Cloudflare Worker.
- **Database**: Prisma ORM on PostgreSQL (adapter-pg) via Neon for production/development.
- **Web3**: Wagmi, RainbowKit, Viem with generated contract hooks.
- **Shared libraries**: `@o3osatoshi/ui`, `@o3osatoshi/toolkit`, `@o3osatoshi/config`, `@o3osatoshi/logging`, `@repo/auth`, `@repo/interface`, `@repo/integrations`.
- **Tooling**: Turborepo, pnpm workspaces, Biome, ESLint (flat config), TypeDoc, Changesets, Renovate.

## Deployment & hosting
- Frontend served from modern edge-ready hosting (Vercel-like setup).
- Serverless APIs via Firebase Cloud Functions (`pnpm deploy:functions`).
- Edge HTTP API via Cloudflare Workers (`pnpm deploy:edge` / `pnpm deploy:edge:prv`).
- Database managed separately; migrations deployed through Prisma scripts.
- Monitoring/logs accessible through Firebase CLI (`pnpm -C apps/functions logs`).

## Environment variables
- `apps/web`: `.env.local` (Next.js runtime + Auth.js, database client, Web3 providers).
- `apps/edge`: `.env.local` for local Wrangler dev (synced from Doppler); production secrets are managed as Cloudflare Worker secrets (synced via `pnpm -C apps/edge env:sync`).
- `packages/prisma`:
  - `.env` (used by Prisma CLI via `prisma.config.ts` + `dotenv/config`)
  - `.env.development.local`, `.env.production.local` (local templates)
- `packages/eth`: `.env.local` for Wagmi code generation.
- Ensure secrets never leave local `.env.*` files; they are gitignored by default.

## Secrets management (Doppler)
- This repository uses the Doppler CLI to manage environment variables and materialize local `.env.*` files used by scripts.
- Authenticate with Doppler before pulling secrets: run `doppler login` (or set a `DOPPLER_TOKEN`).
- Update env files from Doppler:
  - Workspace convenience: `pnpm env:pull` (executes only in packages/apps that define `env:pull`).
  - Prisma package:
    - `pnpm -C packages/prisma env:pull:dev` → writes `packages/prisma/.env.development.local`
    - `pnpm -C packages/prisma env:pull:lcl` → writes `packages/prisma/.env.test.local`
    - `pnpm -C packages/prisma env:pull:prd` → writes `packages/prisma/.env.production.local`
- Edge Worker:
  - `pnpm -C apps/edge env:pull` → writes `apps/edge/.env.local` for local Wrangler dev.
  - `pnpm -C apps/edge env:sync` → syncs secrets from Doppler to Cloudflare Worker via `wrangler secret bulk`.
- Current Doppler setup includes:
  - Prisma: project `portfolio-prisma` with configs `dev`, `lcl`, `prd`.
  - Edge: project `portfolio-edge` with configs such as `dev`, `prd`.

## Releases & dependency updates
- Package versioning and changelog generation are handled by **Changesets**:
  - Changeset entries live under `.changeset/*.md`; see `.changeset/README.md` for the recommended Codex + CI workflow.
  - CI workflow `.github/workflows/release-packages.yml` runs `pnpm release:version` and `pnpm release` to apply changesets and publish packages (or open a release PR if no npm token is configured).
- Dependency updates are automated via **Renovate**:
  - Configuration is in `renovate.json` at the repo root.
  - The Renovate GitHub App is installed on this repository to create upgrade PRs for npm dependencies and GitHub Actions.

## Contact
- **LinkedIn**: [Satoshi Ogura](https://www.linkedin.com/in/satoshi-ogura-189479135)
- **X (Twitter)**: [@o3osatoshi](https://x.com/o3osatoshi)

Feel free to reach out for collaboration, technical discussions, or feedback on the architecture and tooling choices in this repository.
