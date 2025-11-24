[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/domain](../README.md) / CreateTransaction

# Type Alias: CreateTransaction

> **CreateTransaction** = `Omit`\<[`TransactionCore`](../interfaces/TransactionCore.md), `"id"`\>

Defined in: [entities/transaction.ts:32](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/domain/src/entities/transaction.ts#L32)

Validated shape returned when constructing a new transaction that has not yet
been persisted (no `id` assigned).
