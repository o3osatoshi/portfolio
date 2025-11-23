[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetAuthenticatorGroupByPayload

# Type Alias: GetAuthenticatorGroupByPayload\<T\>

> **GetAuthenticatorGroupByPayload**\<`T`\> = [`PrismaPromise`](PrismaPromise.md)\<[`PickEnumerable`](PickEnumerable.md)\<[`AuthenticatorGroupByOutputType`](AuthenticatorGroupByOutputType.md), `T`\[`"by"`\]\> & `{ [P in keyof T & keyof AuthenticatorGroupByOutputType]: P extends "_count" ? T[P] extends boolean ? number : GetScalarType<T[P], AuthenticatorGroupByOutputType[P]> : GetScalarType<T[P], AuthenticatorGroupByOutputType[P]> }`[]\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:215

## Type Parameters

### T

`T` *extends* [`AuthenticatorGroupByArgs`](AuthenticatorGroupByArgs.md)
