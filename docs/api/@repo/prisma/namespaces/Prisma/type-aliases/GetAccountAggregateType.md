[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetAccountAggregateType

# Type Alias: GetAccountAggregateType\<T\>

> **GetAccountAggregateType**\<`T`\> = \{ \[P in keyof T & keyof AggregateAccount\]: P extends "\_count" \| "count" ? T\[P\] extends true ? number : GetScalarType\<T\[P\], AggregateAccount\[P\]\> : GetScalarType\<T\[P\], AggregateAccount\[P\]\> \}

Defined in: packages/prisma/generated/prisma/models/Account.ts:205

## Type Parameters

### T

`T` *extends* [`AccountAggregateArgs`](AccountAggregateArgs.md)
