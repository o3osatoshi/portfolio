[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetVerificationTokenAggregateType

# Type Alias: GetVerificationTokenAggregateType\<T\>

> **GetVerificationTokenAggregateType**\<`T`\> = \{ \[P in keyof T & keyof AggregateVerificationToken\]: P extends "\_count" \| "count" ? T\[P\] extends true ? number : GetScalarType\<T\[P\], AggregateVerificationToken\[P\]\> : GetScalarType\<T\[P\], AggregateVerificationToken\[P\]\> \}

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:114

## Type Parameters

### T

`T` *extends* [`VerificationTokenAggregateArgs`](VerificationTokenAggregateArgs.md)
