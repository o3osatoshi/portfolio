# Repository Guidelines

This document reflects the current state of the repository. The commands listed here are derived from the existing `package.json` files. If scripts, package names, or architecture boundaries change, update this document in the same change.

## Documentation

- Start with [docs/README.md](/Users/o3osatoshi/.codex/worktrees/016b/portfolio/docs/README.md) for repository-level documentation.
- Use [docs/conventions/README.md](/Users/o3osatoshi/.codex/worktrees/016b/portfolio/docs/conventions/README.md) for monorepo-wide engineering conventions that should stay stable across packages and apps.
- In particular:
  - [docs/conventions/rich-error.md](/Users/o3osatoshi/.codex/worktrees/016b/portfolio/docs/conventions/rich-error.md) defines `RichError` usage, including `code`, `kind`, `layer`, `details.action`, `reason`, and `hint`.
  - [docs/conventions/neverthrow.md](/Users/o3osatoshi/.codex/worktrees/016b/portfolio/docs/conventions/neverthrow.md) defines `neverthrow` usage, including `map`, `mapErr`, `andThen`, `orElse`, `andTee`, `orTee`, `ok`, and `okAsync`.
- Do not duplicate those shared conventions here. When a shared policy changes, update `docs/conventions` instead of expanding `AGENTS.md`.

## Convention Lookup Rule

- Consult `docs/conventions` only when the task touches a related concern. Do not load the entire directory by default.
- Open [docs/conventions/rich-error.md](/Users/o3osatoshi/.codex/worktrees/016b/portfolio/docs/conventions/rich-error.md) when introducing, renaming, wrapping, serializing, or reviewing `RichError` usage.
- Open [docs/conventions/neverthrow.md](/Users/o3osatoshi/.codex/worktrees/016b/portfolio/docs/conventions/neverthrow.md) when introducing, refactoring, or reviewing `Result` / `ResultAsync` flows.
- When a code change conflicts with an existing convention, follow the convention unless the change intentionally updates the shared rule. In that case, update the convention document in the same change.

## Convention Update Rule

- If implementation, review, or design discussion establishes a new monorepo-wide rule that should remain stable beyond the current file or package, update `docs/conventions` in the same change.
- Record only durable shared engineering rules in `docs/conventions`. Keep package-specific, temporary, or purely local decisions in the relevant package `README.md` or implementation comments.
- Prefer extending an existing guide before creating a new convention file. Create a new guide only when the rule introduces a distinct cross-cutting concern.
- Treat `AGENTS.md` as the operational trigger for when to update conventions, and treat `docs/conventions` as the canonical store of those shared rules.

## Architecture Overview

- **Domain (`@repo/domain`)**: Value objects, entities, and ports. Internal dependencies are limited to `@o3osatoshi/toolkit` plus external libraries.
- **Application (`@repo/application`)**: DTO validation and use cases. Depends on Domain ports/value objects and `@o3osatoshi/toolkit`.
- **Infrastructure (`@repo/prisma`)**: Prisma-based implementations of Domain ports and database client utilities.
- **Integrations (`@repo/integrations`)**: External service adapters that implement Domain ports, including API and cache integrations.
- **Logging (`@o3osatoshi/logging`)**: Axiom-first logging helpers for Node, Edge, and browser runtimes.
- **Auth (`@repo/auth`)**: Shared Auth.js, Hono auth wiring, and React helpers used by delivery and interface layers.
- **HTTP Interface (`@repo/interface`)**: Hono-based HTTP interface packages for Node and Edge. This layer wires auth and use cases together and does not own business logic.
- **CLI (`@o3osatoshi/cli`)**: Public command-line interface package. It is intentionally self-contained, depends on `@o3osatoshi/toolkit`, and is not designed to couple directly to internal runtime packages such as `auth` or `domain`.
- **Delivery (`apps/web`, `apps/functions`, `apps/edge`)**: Next.js routes, Firebase Functions, and Cloudflare Worker entrypoints that compose infrastructure adapters with application use cases.
- **Presentation (`@o3osatoshi/ui`, `apps/storybook`)**: Reusable UI components and documentation infrastructure, separated from domain concerns.
- **Shared Tooling (`@o3osatoshi/config`, `@o3osatoshi/toolkit`)**: Build presets, lint config, error handling helpers, JSON/Zod helpers, and other cross-cutting utilities.

## Project Structure

- `apps/web`: Next.js 16 portfolio app using the App Router.
- `apps/functions`: Firebase Cloud Functions bundled with `tsup`.
- `apps/edge`: Cloudflare Worker exposing the Edge HTTP API through `@repo/interface/http/edge`.
- `apps/storybook`: Vite-based Storybook for UI review and visual testing.
- `packages/application`: Use cases and DTO validation.
- `packages/auth`: Shared auth configuration and helpers.
- `packages/cli`: Public CLI package for the `o3o` command.
- `packages/config`: Shared tsconfig, Biome, ESLint, and tsup presets.
- `packages/domain`: Core entities, value objects, and ports.
- `packages/eth`: Wagmi-generated contract types and hooks.
- `packages/integrations`: External service adapters such as cache and API clients.
- `packages/interface`: Runtime-agnostic HTTP interface packages and typed RPC surface.
- `packages/logging`: Logging helpers for Node, Edge, and browser runtimes.
- `packages/prisma`: Prisma schema, migrations, adapters, and database scripts.
- `packages/supabase`: Supabase CLI configuration. This is not a pnpm workspace package.
- `packages/toolkit`: Shared error handling, JSON, Zod, and utility helpers.
- `packages/ui`: Reusable UI component library with server/client split builds.

## Setup and Root Scripts

- Install dependencies: `pnpm install` (Node `22.x` required).
- Start all development targets: `pnpm dev`.
- Start scoped development targets: `pnpm dev:web`, `pnpm dev:edge`, `pnpm dev:functions`, `pnpm dev:storybook`.
- Build the entire workspace: `pnpm build`.
- Build scoped targets: `pnpm build:web`, `pnpm build:functions`, `pnpm build:storybook`, `pnpm build:edge`.
- Type-check the workspace: `pnpm check:type`.
- Run all tests: `pnpm check:test`.
- Run tests with coverage: `pnpm check:test:cvrg`.
- Run the combined type + test check: `pnpm check`.
- Run formatting, linting, and `package.json` sorting with writes: `pnpm style`.
- Run formatting, linting, and `package.json` sorting in check mode: `pnpm style:pure`.
- Run Biome only: `pnpm style:biome`, `pnpm style:biome:fix`, `pnpm style:biome:pure`.
- Run ESLint only: `pnpm style:eslint`, `pnpm style:eslint:pure`.
- Run `package.json` sorting only: `pnpm style:pkg`, `pnpm style:pkg:pure`.
- Clean build outputs: `pnpm clean`.
- Pull environment files where supported: `pnpm env:pull`.
- Run the full refinement pipeline: `pnpm refine`.
- Generate API reports: `pnpm api:extract`, `pnpm api:report`.
- Changesets release workflow:
  - Open the interactive changeset editor: `pnpm release:log`
  - Apply pending changesets and update versions: `pnpm release:version`
  - Publish packages: `pnpm release`
- Deploy:
  - Firebase Functions: `pnpm deploy:functions`
  - Edge production: `pnpm deploy:edge`
  - Edge preview: `pnpm deploy:edge:prv`

## App and Package Commands

- Web:
  - `pnpm dev:web`
  - `pnpm -C apps/web build`
  - `pnpm -C apps/web start`
  - `pnpm -C apps/web test`
  - `pnpm -C apps/web typecheck`
- Storybook:
  - `pnpm dev:storybook`
  - `pnpm -C apps/storybook build`
- Functions:
  - `pnpm -C apps/functions dev`
  - `pnpm -C apps/functions serve`
  - `pnpm -C apps/functions deploy`
  - `pnpm -C apps/functions logs`
  - `pnpm -C apps/functions typecheck`
- Edge:
  - `pnpm -C apps/edge dev`
  - `pnpm -C apps/edge build`
  - `pnpm -C apps/edge deploy`
  - `pnpm -C apps/edge deploy:prv`
- Prisma:
  - `pnpm -C packages/prisma migrate:dev`
  - `pnpm -C packages/prisma migrate:deploy`
  - `pnpm -C packages/prisma migrate:reset`
  - `pnpm -C packages/prisma migrate:status`
  - `pnpm -C packages/prisma db:push`
  - `pnpm -C packages/prisma db:seed`
  - `pnpm -C packages/prisma studio`
- CLI:
  - `pnpm -C packages/cli build`
  - `pnpm -C packages/cli test`
  - `pnpm -C packages/cli test:int`
  - `pnpm -C packages/cli typecheck`
- ETH code generation:
  - `pnpm -C packages/eth generate`
- UI library:
  - `pnpm -C packages/ui dev`
  - `pnpm -C packages/ui build`
  - `pnpm -C packages/ui test`
  - `pnpm -C packages/ui typecheck`
- Core and shared packages:
  - `pnpm -C packages/domain test`, `pnpm -C packages/domain typecheck`
  - `pnpm -C packages/application test`, `pnpm -C packages/application typecheck`
  - `pnpm -C packages/auth test`, `pnpm -C packages/auth typecheck`
  - `pnpm -C packages/interface test`, `pnpm -C packages/interface typecheck`
  - `pnpm -C packages/integrations test`, `pnpm -C packages/integrations typecheck`
  - `pnpm -C packages/logging test`, `pnpm -C packages/logging typecheck`
  - `pnpm -C packages/toolkit test`, `pnpm -C packages/toolkit typecheck`

## Code Generation

- Generate Prisma Client: `pnpm -C packages/prisma build`
  - Turbo runs this as part of the `build` pipeline, so Prisma Client generation happens automatically during builds.
- Generate Wagmi/ETH artifacts: `pnpm -C packages/eth generate`
- Run every available `generate` script in the workspace: `pnpm -r run generate`

## Database (Prisma)

- Prisma environment files:
  - `packages/prisma/.env`
  - `packages/prisma/.env.development.local`
  - `packages/prisma/.env.test.local`
  - `packages/prisma/.env.production.local`
- Use scripts from `packages/prisma` for schema, migration, and seed work. There are no root-level database scripts.

## Testing

- The repository uses Vitest with colocated `*.spec.ts(x)` tests.
- Run all tests from the root with `pnpm check:test`.
- Run package-specific tests with `pnpm -C <package> test`.
- Run coverage where available with `pnpm -C <package> test:cvrg`.
- The CLI package also has an integration-style test target: `pnpm -C packages/cli test:int`.

## Coding Style

- `pnpm style` runs `package.json` sorting, ESLint, and Biome in sequence.
- Imports are auto-sorted by Biome and `eslint-plugin-perfectionist`.
- Use double quotes for strings and spaces for indentation.
- Follow these naming defaults unless a framework convention overrides them:
  - Files: kebab-case
  - Components: PascalCase
  - Code symbols: camelCase
- Prefer TypeScript across the repository.
- For stable shared rules around `RichError` and `neverthrow`, consult `docs/conventions` instead of extending this section.

## Security and Configuration

- Store environment variables in the app or package that consumes them:
  - `apps/web/.env.local`
  - `apps/functions/.env.local`
  - `apps/edge/.env.local`
  - `packages/prisma/.env` and environment-specific local variants
  - `packages/eth/.env.local`
  - `packages/cli/.env` when using `env:pull`
- Firebase CLI commands assume an authenticated local environment.
- The minimum supported Node version across the monorepo is `22.x`.

## Notes

- `packages/ui` publishes split server/client bundles. Import `@o3osatoshi/ui/client` from React client components.
- `packages/supabase` contains configuration only and is excluded from the pnpm workspace.
- Keep this file aligned with current scripts, package names, and architecture boundaries.
