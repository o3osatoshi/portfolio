[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetAccountGroupByPayload

# Type Alias: GetAccountGroupByPayload\<T\>

> **GetAccountGroupByPayload**\<`T`\> = [`PrismaPromise`](PrismaPromise.md)\<[`PickEnumerable`](PickEnumerable.md)\<[`AccountGroupByOutputType`](AccountGroupByOutputType.md), `T`\[`"by"`\]\> & `{ [P in keyof T & keyof AccountGroupByOutputType]: P extends "_count" ? T[P] extends boolean ? number : GetScalarType<T[P], AccountGroupByOutputType[P]> : GetScalarType<T[P], AccountGroupByOutputType[P]> }`[]\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:250

## Type Parameters

### T

`T` *extends* [`AccountGroupByArgs`](AccountGroupByArgs.md)
