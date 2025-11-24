[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @repo/application

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

## Notes
- Source‑first: this package does not ship a dist build. Apps transpile TypeScript from this package directly (via Next's `transpilePackages`).
- Errors: application‑level errors are shaped via `newApplicationError` wrapping the shared toolkit.

## Classes

- [CreateTransactionUseCase](classes/CreateTransactionUseCase.md)
- [DeleteTransactionUseCase](classes/DeleteTransactionUseCase.md)
- [GetTransactionsUseCase](classes/GetTransactionsUseCase.md)
- [UpdateTransactionUseCase](classes/UpdateTransactionUseCase.md)

## Type Aliases

- [CreateTransactionRequest](type-aliases/CreateTransactionRequest.md)
- [CreateTransactionResponse](type-aliases/CreateTransactionResponse.md)
- [DeleteTransactionRequest](type-aliases/DeleteTransactionRequest.md)
- [GetTransactionsRequest](type-aliases/GetTransactionsRequest.md)
- [GetTransactionsResponse](type-aliases/GetTransactionsResponse.md)
- [TransactionResponse](type-aliases/TransactionResponse.md)
- [UpdateTransactionRequest](type-aliases/UpdateTransactionRequest.md)

## Variables

- [createTransactionRequestSchema](variables/createTransactionRequestSchema.md)
- [deleteTransactionRequestSchema](variables/deleteTransactionRequestSchema.md)
- [getTransactionsRequestSchema](variables/getTransactionsRequestSchema.md)
- [parseCreateTransactionRequest](variables/parseCreateTransactionRequest.md)
- [parseDeleteTransactionRequest](variables/parseDeleteTransactionRequest.md)
- [parseGetTransactionsRequest](variables/parseGetTransactionsRequest.md)
- [parseUpdateTransactionRequest](variables/parseUpdateTransactionRequest.md)
- [updateTransactionRequestSchema](variables/updateTransactionRequestSchema.md)

## Functions

- [toTransactionResponse](functions/toTransactionResponse.md)
- [toTransactionsResponse](functions/toTransactionsResponse.md)
