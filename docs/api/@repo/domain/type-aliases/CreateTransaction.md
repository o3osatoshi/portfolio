[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/domain](../README.md) / CreateTransaction

# Type Alias: CreateTransaction

> **CreateTransaction** = `Omit`\<`TransactionCore`, `"id"`\>

Defined in: [entities/transaction.ts:32](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/domain/src/entities/transaction.ts#L32)

Validated shape returned when constructing a new transaction that has not yet
been persisted (no `id` assigned).
