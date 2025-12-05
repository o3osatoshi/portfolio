# Gemini Context: o3osatoshi Portfolio

## Project Overview

This is a personal portfolio and experimentation platform for Satoshi Ogura, implemented as a TypeScript monorepo. It demonstrates clean architecture, modular React UI, and modern tooling across web, serverless (Firebase), and blockchain (Wagmi/ETH) integrations.

### Architecture Layers
The codebase enforces a strict dependency rule: **Dependencies point inwards.**

*   **Domain (`@repo/domain`)**: Core business logic, entities, value objects, and repository ports. Depends ONLY on `@o3osatoshi/toolkit`.
*   **Application (`@repo/application`)**: Use cases and DTO validation. Orchestrates domain logic. Depends on Domain.
*   **Infrastructure (`@repo/prisma`)**: Adapters (Prisma) that fulfill domain ports. Depends on Domain and Application.
*   **Delivery (`apps/web`, `apps/functions`)**: Entry points (Next.js, Firebase Functions). Injects Infrastructure into Application use cases.
*   **Presentation (`@o3osatoshi/ui`, `apps/storybook`)**: Shared UI components and documentation. Decoupled from domain logic.

### Key Technologies
*   **Runtime:** Node.js >= 22
*   **Package Manager:** pnpm >= 10 (Workspaces)
*   **Build System:** Turborepo
*   **Frontend:** Next.js 15, React 19, Tailwind CSS
*   **Backend:** Firebase Cloud Functions
*   **Database:** PostgreSQL via Prisma ORM
*   **Web3:** Wagmi, Viem, RainbowKit

## Building and Running

### Prerequisites
*   Node.js >= 22
*   pnpm >= 10
*   Docker (for tests)

### Core Commands

| Action | Command | Description |
| :--- | :--- | :--- |
| **Install** | `pnpm install` | Install dependencies. |
| **Dev** | `pnpm dev` | Start all dev servers (Web, Storybook, Functions). |
| **Build** | `pnpm build` | Build all packages and apps. |
| **Test** | `pnpm check:test` | Run Vitest across the workspace. |
| **Typecheck** | `pnpm check:type` | Run TypeScript compiler check. |
| **Lint/Format**| `pnpm style` | Run Sort Package JSON -> ESLint -> Biome. |
| **Clean** | `pnpm clean` | Remove build artifacts. |

### Component-Specific Commands

*   **Web App:** `pnpm dev:web` / `pnpm -C apps/web build`
*   **Storybook:** `pnpm dev:storybook` / `pnpm -C apps/storybook build`
*   **Functions:** `pnpm -C apps/functions dev` / `pnpm -C apps/functions deploy`
*   **Edge:** `pnpm -C apps/edge dev` / `pnpm -C apps/edge deploy`

### Database (Prisma)
*   **Migrate Dev:** `pnpm -C packages/prisma migrate:dev`
*   **Deploy Schema:** `pnpm -C packages/prisma migrate:deploy`
*   **Generate Client:** `pnpm -C packages/prisma build`
*   **Studio:** `pnpm -C packages/prisma studio`

## Development Conventions

### Code Style
*   **Formatting:** Handled by Biome (`pnpm style:biome`).
*   **Linting:** Handled by ESLint (`pnpm style:eslint`).
*   **Naming:**
    *   Files: `kebab-case` (e.g., `user-profile.tsx`)
    *   Components: `PascalCase` (e.g., `UserProfile`)
    *   Variables/Functions: `camelCase`
*   **Imports:** Auto-organized by Biome + `eslint-plugin-perfectionist`.

### Testing
*   **Framework:** Vitest.
*   **Location:** Colocated `*.spec.ts` or `*.spec.tsx` files.
*   **Running:** `pnpm check:test` (root) or `pnpm -C packages/<pkg> test` (scoped).

### Environment Variables
Secrets are managed via Doppler but materialized into local files:
*   `apps/web/.env.local`
*   `packages/prisma/.env.development.local`
*   `packages/prisma/.env.production.local`
*   `packages/eth/.env.local`

**Note:** Always check `AGENTS.md` for the most up-to-date architectural guidelines and command references.
