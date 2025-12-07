[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetUserAggregateType

# Type Alias: GetUserAggregateType\<T\>

> **GetUserAggregateType**\<`T`\> = \{ \[P in keyof T & keyof AggregateUser\]: P extends "\_count" \| "count" ? T\[P\] extends true ? number : GetScalarType\<T\[P\], AggregateUser\[P\]\> : GetScalarType\<T\[P\], AggregateUser\[P\]\> \}

Defined in: packages/prisma/generated/prisma/models/User.ts:139

## Type Parameters

### T

`T` *extends* [`UserAggregateArgs`](UserAggregateArgs.md)
