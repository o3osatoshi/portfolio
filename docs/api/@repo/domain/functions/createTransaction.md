[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/domain](../README.md) / createTransaction

# Function: createTransaction()

> **createTransaction**(`tx`): `Result`\<[`CreateTransaction`](../type-aliases/CreateTransaction.md), `Error`\>

Defined in: [entities/transaction.ts:106](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/domain/src/entities/transaction.ts#L106)

Validate raw input collected from external layers into a transaction ready to
be persisted. Aggregates validation errors using `neverthrow.Result`.

## Parameters

### tx

[`CreateTransactionInput`](../type-aliases/CreateTransactionInput.md)

## Returns

`Result`\<[`CreateTransaction`](../type-aliases/CreateTransaction.md), `Error`\>
