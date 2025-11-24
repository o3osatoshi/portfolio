[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/domain](../README.md) / updateTransaction

# Function: updateTransaction()

> **updateTransaction**(`tx`, `patch`): `Result`\<[`Transaction`](../type-aliases/Transaction.md), `Error`\>

Defined in: [entities/transaction.ts:194](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/domain/src/entities/transaction.ts#L194)

Apply a partial update to an existing transaction while enforcing
immutability rules (e.g., ID consistency) and value-object invariants.

## Parameters

### tx

[`Transaction`](../type-aliases/Transaction.md)

### patch

[`UpdateTransactionInput`](../type-aliases/UpdateTransactionInput.md)

## Returns

`Result`\<[`Transaction`](../type-aliases/Transaction.md), `Error`\>
