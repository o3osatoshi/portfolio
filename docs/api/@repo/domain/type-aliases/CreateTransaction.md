[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/domain](../README.md) / CreateTransaction

# Type Alias: CreateTransaction

> **CreateTransaction** = `Omit`\<`TransactionCore`, `"id"`\>

Defined in: [entities/transaction.ts:32](https://github.com/o3osatoshi/experiment/blob/04dfa58df6e48824a200a24d77afef7ce464e1ae/packages/domain/src/entities/transaction.ts#L32)

Validated shape returned when constructing a new transaction that has not yet
been persisted (no `id` assigned).
