# @repo/domain (internal)

Domain layer used internally in this monorepo. It follows a source‑first model: apps import `src/*.ts` directly.

## Overview
- Purpose: Domain entities, value objects, and ports (repository interfaces), plus domain‑level error helpers
- Format: Source‑first (no build artifacts; apps read from `./src`)
- Exports: `package.json` maps `"."` to `"./src/index.ts"`

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
};
```

2) Import

```ts
import { newUserId, newTransactionId } from "@repo/domain";
import type { TransactionRepository } from "@repo/domain";
```

## Error helpers

Use the domain‑aware constructor to create consistently shaped errors:

```ts
import { domainValidationError, newDomainError } from "@repo/domain";

throw domainValidationError({
  action: "CreateTransaction",
  reason: "amount must be positive",
});

// or the generic helper
throw newDomainError({
  kind: "Validation",
  action: "CreateUser",
  reason: "email is invalid",
  hint: "ensure email has @",
});
```

## Structure
- `entities/`: Domain entities (e.g., Transaction)
- `value-objects/`: Strongly typed values (e.g., UserId, TransactionId)
- `ports/`: Interfaces (e.g., `TransactionRepository`) used by the application layer

Everything is re‑exported from `src/index.ts`.

## Notes
- Source‑first: apps transpile TypeScript from this package directly (via Next `transpilePackages`).
- Dependencies: uses `decimal.js` and `neverthrow` at runtime.
- Node >= 22 (see package.json `engines`).

## Scripts
- `pnpm -C packages/domain test` — Run unit tests
- `pnpm -C packages/domain test:run` — Run tests in CI mode

## Quality

- Tests: `pnpm -C packages/domain test` / `pnpm -C packages/domain test:cvrg`
- Coverage: [![Coverage: @repo/domain](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=domain)](https://app.codecov.io/github/o3osatoshi/portfolio?component=domain)
