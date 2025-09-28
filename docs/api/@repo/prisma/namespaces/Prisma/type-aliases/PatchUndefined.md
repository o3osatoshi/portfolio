[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / PatchUndefined

# Type Alias: PatchUndefined\<O, O1\>

> **PatchUndefined**\<`O`, `O1`\> = `{ [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K] }` & `object`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:251

## Type Parameters

### O

`O` *extends* `object`

### O1

`O1` *extends* `object`
