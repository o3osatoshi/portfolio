[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / Prisma\_\_Pick

# Type Alias: Prisma\_\_Pick\<T, K\>

> **Prisma\_\_Pick**\<`T`, `K`\> = `{ [P in K]: T[P] }`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:149

From T, pick a set of properties whose keys are in the union K

## Type Parameters

### T

`T`

### K

`K` *extends* keyof `T`
