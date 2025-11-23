[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SelectSubset

# Type Alias: SelectSubset\<T, U\>

> **SelectSubset**\<`T`, `U`\> = `{ [key in keyof T]: key extends keyof U ? T[key] : never }` & `T` *extends* [`SelectAndInclude`](SelectAndInclude.md) ? `` "Please either choose `select` or `include`." `` : `T` *extends* [`SelectAndOmit`](SelectAndOmit.md) ? `` "Please either choose `select` or `omit`." `` : `object`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:168

SelectSubset

## Type Parameters

### T

`T`

### U

`U`

## Remarks

From `T` pick properties that exist in `U`. Simple version of Intersection.
Additionally, it validates, if both select and include are present. If the case, it errors.
