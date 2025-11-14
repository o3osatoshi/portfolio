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
- **Delivery (`apps/web`, `apps/functions`)** – Next.js route handlers and Firebase Functions that inject infrastructure adapters into use cases.
- **Presentation (`@o3osatoshi/ui`, `apps/storybook`)** – Published UI library and Storybook documentation without domain coupling.
- **Shared tooling (`@o3osatoshi/config`, `@o3osatoshi/toolkit`)** – Build presets, lint configs, and error utilities consumed everywhere.

### Monorepo layout
```
⏺ root/
  ├── 📁 apps/
  │   ├── 📁 web/              # Next.js 15 portfolio app (React 19, App Router)
  │   ├── 📁 functions/        # Firebase Cloud Functions delivery layer
  │   └── 📁 storybook/        # Vite Storybook for @o3osatoshi/ui
  ├── 📁 packages/
  │   ├── 📁 domain/           # Core entities, value objects, ports
  │   ├── 📁 application/      # DTOs + use cases orchestrating domain logic
  │   ├── 📁 prisma/           # Prisma schema, adapters, and DB utilities
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
- `pnpm pull:env` – Run `pull:env` scripts only in packages/apps that define them (updates local `.env*` files).
- `pnpm docs` – Generate API docs via TypeDoc.
- `pnpm deploy:functions` – Deploy Firebase Cloud Functions.
- `pnpm api:extract` / `pnpm api:report` – Run API extractor across publishable libraries.

### App and package targets
- Web app: `pnpm dev:web`, `pnpm -C apps/web build`, `pnpm -C apps/web start`.
- Storybook: `pnpm dev:storybook`, `pnpm -C apps/storybook build`.
- Firebase functions: `pnpm -C apps/functions dev`, `pnpm -C apps/functions serve`, `pnpm -C apps/functions deploy`.
- UI library: `pnpm -C packages/ui dev`, `pnpm -C packages/ui build`, `pnpm -C packages/ui test`.
- Domain/Application/Toolkit/Config: `pnpm -C packages/<name> test`, `pnpm -C packages/<name> typecheck`.

## Database workflow (Prisma)
- Development migrate: `pnpm -C packages/prisma migrate:dev`
- Production deploy: `pnpm -C packages/prisma migrate:deploy`
- Push schema without migrations: `pnpm -C packages/prisma db:push`
- Seed data: `pnpm -C packages/prisma seed`
- Inspect status: `pnpm -C packages/prisma migrate:status`
- Prisma Studio: `pnpm -C packages/prisma studio`

Environment files:
- `packages/prisma/.env.development.local`
- `packages/prisma/.env.production.local`

All scripts are wrapped with `dotenv-cli`, so ensure the appropriate `.env.*.local` file exists before running them.

## Code generation
- Prisma client (runs on `postinstall`): `pnpm -C packages/prisma generate`
- Wagmi/ETH hooks (requires `packages/eth/.env.local`): `pnpm -C packages/eth generate`
- Run every declared `generate` script: `pnpm -r run generate`

## Testing
- Primary framework: **Vitest** with colocated `*.spec.ts(x)` files.
- Workspace: `pnpm check:test` orchestrates all package `test` scripts via Turbo.
- Per package: `pnpm -C packages/domain test`, `pnpm -C packages/ui test`, etc.
- Coverage: `pnpm -C <package> test:cvrg`

## Technology stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, App Router.
- **Backend**: Firebase Functions (Node 22) calling application use cases.
- **Database**: Prisma ORM on PostgreSQL (adapter-pg).
- **Web3**: Wagmi, RainbowKit, Viem with generated contract hooks.
- **Shared libraries**: `@o3osatoshi/ui`, `@o3osatoshi/toolkit`, `@o3osatoshi/config`.
- **Tooling**: Turborepo, pnpm workspaces, Biome, ESLint (flat config), TypeDoc.

## Deployment & hosting
- Frontend served from modern edge-ready hosting (Vercel-like setup).
- Serverless APIs via Firebase Cloud Functions (`pnpm deploy:functions`).
- Database managed separately; migrations deployed through Prisma scripts.
- Monitoring/logs accessible through Firebase CLI (`pnpm -C apps/functions logs`).

## Environment variables
- `apps/web`: `.env.local` (Next.js runtime + Auth.js, database client, Web3 providers).
- `packages/prisma`: `.env.development.local`, `.env.production.local` (database connection strings).
- `packages/eth`: `.env.local` for Wagmi code generation.
- Ensure secrets never leave local `.env.*` files; they are gitignored by default.

## Secrets management (Doppler)
- This repository uses the Doppler CLI to manage environment variables and materialize local `.env.*` files used by scripts.
- Authenticate with Doppler before pulling secrets: run `doppler login` (or set a `DOPPLER_TOKEN`).
- Update env files from Doppler:
  - Workspace convenience: `pnpm pull:env` (executes only in packages/apps that define `pull:env`).
  - Prisma package:
    - `pnpm -C packages/prisma pull:env:dev` → writes `packages/prisma/.env.development.local`
    - `pnpm -C packages/prisma pull:env:lcl` → writes `packages/prisma/.env.test.local`
    - `pnpm -C packages/prisma pull:env:prd` → writes `packages/prisma/.env.production.local`
- Current Doppler setup for Prisma uses project `portfolio-prisma` with configs `dev`, `lcl`, and `prd`.

## Contact
- **LinkedIn**: [Satoshi Ogura](https://www.linkedin.com/in/satoshi-ogura-189479135)
- **X (Twitter)**: [@o3osatoshi](https://x.com/o3osatoshi)

Feel free to reach out for collaboration, technical discussions, or feedback on the architecture and tooling choices in this repository.
