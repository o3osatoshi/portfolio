[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetUserGroupByPayload

# Type Alias: GetUserGroupByPayload\<T\>

> **GetUserGroupByPayload**\<`T`\> = [`PrismaPromise`](PrismaPromise.md)\<[`PickEnumerable`](PickEnumerable.md)\<[`UserGroupByOutputType`](UserGroupByOutputType.md), `T`\[`"by"`\]\> & `{ [P in keyof T & keyof UserGroupByOutputType]: P extends "_count" ? T[P] extends boolean ? number : GetScalarType<T[P], UserGroupByOutputType[P]> : GetScalarType<T[P], UserGroupByOutputType[P]> }`[]\>

Defined in: packages/prisma/generated/prisma/models/User.ts:174

## Type Parameters

### T

`T` *extends* [`UserGroupByArgs`](UserGroupByArgs.md)
