# @repo/application (internal)

Internal application layer for use within this monorepo. It follows a source‑first model: apps import `src/*.ts` directly.

## Overview
- Purpose: Application/use‑case orchestration, DTO parsers/validators, and typed error helpers
- Format: Source‑first (no build artifacts; apps read from `./src`)
- Exports: `package.json` maps `"."` to `"./src/index.ts"`

## Usage (apps)
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
};
```

2) Import

```ts
import { someUseCase } from "@repo/application"; // exported via src/index.ts
```

## Scripts
- `pnpm -C packages/application typecheck` — Typecheck only (no build)
- `pnpm -C packages/application test` — Run unit tests

## Quality

- Tests: `pnpm -C packages/application test` / `pnpm -C packages/application test:cvrg`
- Coverage: [![Coverage: @repo/application](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=application)](https://app.codecov.io/github/o3osatoshi/portfolio?component=application)

## Notes
- Source‑first: this package does not ship a dist build. Apps transpile TypeScript from this package directly (via Next's `transpilePackages`).
- Errors: application‑level errors are shaped via `newApplicationError` wrapping the shared toolkit.
