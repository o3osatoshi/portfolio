[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/domain](../README.md) / CreateTransaction

# Type Alias: CreateTransaction

> **CreateTransaction** = `Omit`\<`TransactionCore`, `"id"`\>

Defined in: [entities/transaction.ts:32](https://github.com/o3osatoshi/experiment/blob/54ab00df974a3e9f8283fbcd8c611ed1e0274132/packages/domain/src/entities/transaction.ts#L32)

Validated shape returned when constructing a new transaction that has not yet
been persisted (no `id` assigned).
