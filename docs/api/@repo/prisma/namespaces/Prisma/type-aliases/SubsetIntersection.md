[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SubsetIntersection

# Type Alias: SubsetIntersection\<T, U, K\>

> **SubsetIntersection**\<`T`, `U`, `K`\> = `{ [key in keyof T]: key extends keyof U ? T[key] : never }` & `K`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:181

Subset + Intersection

## Type Parameters

### T

`T`

### U

`U`

### K

`K`

## Desc

From `T` pick properties that exist in `U` and intersect `K`
