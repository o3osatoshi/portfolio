[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetScalarType

# Type Alias: GetScalarType\<T, O\>

> **GetScalarType**\<`T`, `O`\> = `O` *extends* `object` ? `{ [P in keyof T]: P extends keyof O ? O[P] : never }` : `never`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:341

## Type Parameters

### T

`T`

### O

`O`
