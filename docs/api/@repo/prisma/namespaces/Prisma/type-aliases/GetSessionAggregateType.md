[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetSessionAggregateType

# Type Alias: GetSessionAggregateType\<T\>

> **GetSessionAggregateType**\<`T`\> = \{ \[P in keyof T & keyof AggregateSession\]: P extends "\_count" \| "count" ? T\[P\] extends true ? number : GetScalarType\<T\[P\], AggregateSession\[P\]\> : GetScalarType\<T\[P\], AggregateSession\[P\]\> \}

Defined in: packages/prisma/generated/prisma/models/Session.ts:126

## Type Parameters

### T

`T` *extends* [`SessionAggregateArgs`](SessionAggregateArgs.md)
