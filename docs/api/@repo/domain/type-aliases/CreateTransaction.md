[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/domain](../README.md) / CreateTransaction

# Type Alias: CreateTransaction

> **CreateTransaction** = `Omit`\<`TransactionCore`, `"id"`\>

Defined in: [entities/transaction.ts:32](https://github.com/o3osatoshi/experiment/blob/f1d231870a1d13a36a9ead236d22edc1fb9797dd/packages/domain/src/entities/transaction.ts#L32)

Validated shape returned when constructing a new transaction that has not yet
been persisted (no `id` assigned).
