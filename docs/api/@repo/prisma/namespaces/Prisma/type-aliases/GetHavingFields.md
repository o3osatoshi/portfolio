[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetHavingFields

# Type Alias: GetHavingFields\<T\>

> **GetHavingFields**\<`T`\> = `{ [K in keyof T]: Or<Or<Extends<"OR", K>, Extends<"AND", K>>, Extends<"NOT", K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K }`\[keyof `T`\]

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:352

## Type Parameters

### T

`T`
