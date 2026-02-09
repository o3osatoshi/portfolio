[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @repo/domain

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
import { domainErrorCodes, newDomainError } from "@repo/domain";

throw newDomainError({
  code: domainErrorCodes.CURRENCY_CODE_FORMAT_INVALID,
  details: {
    action: "CreateUser",
    hint: "ensure email has @",
    reason: "email is invalid",
  },
  kind: "Validation",
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

## Interfaces

- [Base](interfaces/Base.md)
- [TransactionCore](interfaces/TransactionCore.md)
- [TransactionRepository](interfaces/TransactionRepository.md)

## Type Aliases

- [Amount](type-aliases/Amount.md)
- [Brand](type-aliases/Brand.md)
- [CreateTransaction](type-aliases/CreateTransaction.md)
- [CreateTransactionInput](type-aliases/CreateTransactionInput.md)
- [CurrencyCode](type-aliases/CurrencyCode.md)
- [DateTime](type-aliases/DateTime.md)
- [DecimalString](type-aliases/DecimalString.md)
- [Fee](type-aliases/Fee.md)
- [NewBaseInput](type-aliases/NewBaseInput.md)
- [NewTransactionInput](type-aliases/NewTransactionInput.md)
- [Price](type-aliases/Price.md)
- [ProfitLoss](type-aliases/ProfitLoss.md)
- [Transaction](type-aliases/Transaction.md)
- [TransactionId](type-aliases/TransactionId.md)
- [TransactionType](type-aliases/TransactionType.md)
- [UpdateTransactionInput](type-aliases/UpdateTransactionInput.md)
- [UserId](type-aliases/UserId.md)

## Functions

- [createTransaction](functions/createTransaction.md)
- [isAmount](functions/isAmount.md)
- [isCurrencyCode](functions/isCurrencyCode.md)
- [isDateTime](functions/isDateTime.md)
- [isDecimal](functions/isDecimal.md)
- [isFee](functions/isFee.md)
- [isPrice](functions/isPrice.md)
- [isProfitLoss](functions/isProfitLoss.md)
- [isTransactionId](functions/isTransactionId.md)
- [isTransactionType](functions/isTransactionType.md)
- [isUserId](functions/isUserId.md)
- [newAmount](functions/newAmount.md)
- [newBase](functions/newBase.md)
- [newCurrencyCode](functions/newCurrencyCode.md)
- [newDateTime](functions/newDateTime.md)
- [newDecimal](functions/newDecimal.md)
- [newFee](functions/newFee.md)
- [newPrice](functions/newPrice.md)
- [newProfitLoss](functions/newProfitLoss.md)
- [newTransaction](functions/newTransaction.md)
- [newTransactionId](functions/newTransactionId.md)
- [newTransactionType](functions/newTransactionType.md)
- [newUserId](functions/newUserId.md)
- [updateTransaction](functions/updateTransaction.md)
