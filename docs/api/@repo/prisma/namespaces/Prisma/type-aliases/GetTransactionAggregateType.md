[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetTransactionAggregateType

# Type Alias: GetTransactionAggregateType\<T\>

> **GetTransactionAggregateType**\<`T`\> = \{ \[P in keyof T & keyof AggregateTransaction\]: P extends "\_count" \| "count" ? T\[P\] extends true ? number : GetScalarType\<T\[P\], AggregateTransaction\[P\]\> : GetScalarType\<T\[P\], AggregateTransaction\[P\]\> \}

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:211

## Type Parameters

### T

`T` *extends* [`TransactionAggregateArgs`](TransactionAggregateArgs.md)
