[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / Subset

# Type Alias: Subset\<T, U\>

> **Subset**\<`T`, `U`\> = `{ [key in keyof T]: key extends keyof U ? T[key] : never }`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:159

Subset

## Type Parameters

### T

`T`

### U

`U`

## Remarks

From `T` pick properties that exist in `U`. Simple version of Intersection
