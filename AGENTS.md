# Repository Guidelines

## Project Structure & Modules
- `apps/web`: Next.js app (user-facing portfolio).
- `apps/functions`: Firebase Cloud Functions (build with `tsup`).
- `apps/storybook`: Storybook for UI review and docs.
- `packages/ui`: Shared React UI components.
- `packages/domain`, `packages/application`: Domain and application layers.
- `packages/prisma`: Prisma schema, client, and DB scripts.
- `packages/validation`, `packages/eth`, `packages/tsrc`, `packages/supabase`: Supporting libs and config.

## Build, Dev, and DB
- **Install**: `pnpm install` (Node >= 22).
- **Dev (all)**: `pnpm dev` (Turbo runs package dev scripts).
- **Build (all)**: `pnpm build`.
- **Generate (codegen)**: `pnpm generate` (e.g., Prisma client).
- **Storybook**: `pnpm -C apps/storybook dev` (build: `pnpm -C apps/storybook build`).
- **Web app**: `pnpm -C apps/web dev` (prod: `pnpm -C apps/web start`).
- **Functions (emulator)**: `pnpm -C apps/functions serve` (deploy: `pnpm deploy:functions`).
- **Database (Prisma via workspace)**:
  - Dev migrate: `pnpm db:migrate:dev`
  - Deploy migrations: `pnpm db:migrate:deploy`
  - Seed: `pnpm db:seed`

## Coding Style & Conventions
- **Lint/format**: Biome. Run `pnpm lint` or `pnpm lint:fix`.
- **Indentation**: spaces; **Quotes**: double (Biome enforced).
- **Imports**: auto-organized (Biome).
- **TypeScript** preferred across apps/packages. React components in `packages/ui` and `apps/web` follow file-based routing (Next.js) and co-located component styles.
- **Naming**: kebab-case files, PascalCase components, camelCase variables/functions.

## Testing Guidelines
- **Framework**: Vitest (package-level). Place unit tests next to code as `*.test.ts(x)`.
- **Run tests** per package, e.g.: `pnpm -C apps/storybook vitest run`.
- **Coverage**: emphasize domain/application logic; snapshot UI where helpful in Storybook.

## Commit & PR Guidelines
- **Commits**: Conventional Commits with scopes. Examples:
  - `feat(web): add project grid`
  - `refactor(application-use-case): simplify actor flows`
  - `fix(prisma): correct schema relation`
- **PRs**: clear summary, link issues, screenshots/GIFs for UI, note env/DB changes, ensure `pnpm build` and `pnpm lint` pass.

## Security & Config
- **Env**: use `.env.*` in `apps/web` and `packages/prisma`; never commit secrets.
- **Firebase**: deploy only functions with `pnpm deploy:functions`. Logs: `pnpm -C apps/functions logs`.
