[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / Overwrite

# Type Alias: Overwrite\<O, O1\>

> **Overwrite**\<`O`, `O1`\> = `{ [K in keyof O]: K extends keyof O1 ? O1[K] : O[K] }` & `object`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:257

## Type Parameters

### O

`O` *extends* `object`

### O1

`O1` *extends* `object`
