[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetSessionGroupByPayload

# Type Alias: GetSessionGroupByPayload\<T\>

> **GetSessionGroupByPayload**\<`T`\> = [`PrismaPromise`](PrismaPromise.md)\<[`PickEnumerable`](PickEnumerable.md)\<[`SessionGroupByOutputType`](SessionGroupByOutputType.md), `T`\[`"by"`\]\> & `{ [P in keyof T & keyof SessionGroupByOutputType]: P extends "_count" ? T[P] extends boolean ? number : GetScalarType<T[P], SessionGroupByOutputType[P]> : GetScalarType<T[P], SessionGroupByOutputType[P]> }`[]\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:160

## Type Parameters

### T

`T` *extends* [`SessionGroupByArgs`](SessionGroupByArgs.md)
