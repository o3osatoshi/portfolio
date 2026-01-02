# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `pnpm dev` - Start all dev targets via Turbo (web, Storybook, functions, edge)
- `pnpm dev:web` - Start Next.js app only
- `pnpm dev:storybook` - Start Storybook only
- `pnpm dev:functions` - Start Firebase Functions only
- `pnpm dev:edge` - Start Cloudflare Worker only

### Build & Type Checking
- `pnpm build` - Build all packages/apps respecting dependencies
- `pnpm check:type` - Workspace-wide TypeScript compilation with `noEmit`
- `pnpm check:test` - Run all tests across packages
- `pnpm check:test:cvrg` - Run tests with coverage reports
- `pnpm check` - Combined type-check and test execution

### Code Quality
- `pnpm style` - Run package sort + ESLint (fix) + Biome (write)
- `pnpm style:pure` - Check-only version for CI (package sort + ESLint + Biome)
- `pnpm clean` - Remove build artifacts across packages

### Database (Prisma)
All Prisma commands must be run from the `packages/prisma` directory:
- `pnpm -C packages/prisma migrate:dev` - Create and apply development migrations
- `pnpm -C packages/prisma migrate:deploy` - Apply migrations to production
- `pnpm -C packages/prisma db:push` - Push schema without migrations
- `pnpm -C packages/prisma db:seed` - Seed database with initial data
- `pnpm -C packages/prisma studio` - Open Prisma Studio GUI

### Testing
- Package-specific: `pnpm -C packages/<name> test`
- With coverage: `pnpm -C packages/<name> test:cvrg`
- UI library: `pnpm -C packages/ui test`

## Architecture Overview

This is a clean architecture monorepo with the following layers:

### Core Layers
- **Domain** (`packages/domain`) - Entities, value objects, and repository ports using `neverthrow`
- **Application** (`packages/application`) - DTOs (Zod validation) and use cases orchestrating domain logic
- **Infrastructure** (`packages/prisma`, `packages/integrations`) - Concrete implementations of domain ports

### Interface & Delivery
- **HTTP Interface** (`packages/interface`) - Hono-based HTTP interface with typed RPC client for Node/Edge runtimes
- **Delivery Apps**:
  - `apps/web` - Next.js 15 portfolio app (React 19, App Router)
  - `apps/functions` - Firebase Cloud Functions
  - `apps/edge` - Cloudflare Worker

### Shared Libraries
- **UI** (`packages/ui`) - React component library with server/client splits
- **Auth** (`packages/auth`) - Auth.js/Hono configuration and React helpers
- **Toolkit** (`packages/toolkit`) - Zod/Neverthrow error utilities
- **Config** (`packages/config`) - Shared build presets, lint configs
- **Logging** (`packages/logging`) - Axiom-based logging for Node/Edge/Browser

## Key Development Patterns

### Package Dependencies
- Domain depends only on `@o3osatoshi/toolkit`
- Application depends on domain ports/value objects
- Infrastructure packages implement domain ports
- HTTP interface wires auth + use cases without owning business logic
- UI library stays free from domain concerns

### Testing Framework
- **Vitest** with colocated `*.spec.ts(x)` files
- Coverage tracked via Codecov with per-package flags
- Prisma uses Testcontainers for integration tests

### Code Generation
- Prisma client: Auto-generated during `pnpm build` via Turbo dependencies
- Wagmi/ETH hooks: `pnpm -C packages/eth generate` (requires `.env.local`)

## Environment Configuration

### Required Environment Files
- `apps/web/.env.local` - Next.js runtime, Auth.js, database client, Web3 providers
- `packages/prisma/.env` - Used by Prisma CLI (via `prisma.config.ts` + `dotenv/config`)
- `packages/eth/.env.local` - For Wagmi CLI code generation
- `apps/edge/.env.local` - Wrangler dev environment

### Secrets Management
- Uses Doppler CLI for environment variable management
- `pnpm env:pull` - Updates env files from Doppler (only in packages/apps that define it)
- Never commit secrets to git (`.env*` files are gitignored)

## Build System (Turborepo)

### Task Dependencies
- Build tasks depend on `^build` (upstream package builds)
- Test tasks depend on `^build` and `^test`
- Type checking depends on `^typecheck`

### Caching
- Build outputs cached in Turbo for faster rebuilds
- Test results cached unless coverage is requested
- Clean builds available via `pnpm clean`

## Package Structure Notes

### UI Library (`packages/ui`)
- Split server/client builds for React components
- Import `@o3osatoshi/ui/client` for client components
- Import `@o3osatoshi/ui` (server) for server components
- Stories and tests colocated with components

### Prisma Package (`packages/prisma`)
- Contains schema, migrations, seeds, and adapters
- Generates Prisma client during build process
- Repository adapters implement domain ports

### Interface Package (`packages/interface`)
- Runtime-agnostic HTTP interface using Hono
- Typed RPC client for both Node and Edge environments
- Separate apps for different runtime contexts

## Deployment Commands

- `pnpm deploy:functions` - Deploy Firebase Cloud Functions
- `pnpm deploy:edge` - Deploy Cloudflare Worker (production)
- `pnpm deploy:edge:prv` - Deploy Cloudflare Worker (preview)

## Code Style Conventions

- **Formatter**: Biome (double quotes, spaces for indentation)
- **Linting**: ESLint with perfectionist plugin for import organization
- **Naming**: Files = kebab-case, Components = PascalCase, Code = camelCase
- **TypeScript**: Preferred everywhere, strict configuration
- **Node Version**: >=22 required for all packages