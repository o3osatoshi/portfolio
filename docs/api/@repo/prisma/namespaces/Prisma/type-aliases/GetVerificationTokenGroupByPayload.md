[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetVerificationTokenGroupByPayload

# Type Alias: GetVerificationTokenGroupByPayload\<T\>

> **GetVerificationTokenGroupByPayload**\<`T`\> = [`PrismaPromise`](PrismaPromise.md)\<[`PickEnumerable`](PickEnumerable.md)\<[`VerificationTokenGroupByOutputType`](VerificationTokenGroupByOutputType.md), `T`\[`"by"`\]\> & `{ [P in keyof T & keyof VerificationTokenGroupByOutputType]: P extends "_count" ? T[P] extends boolean ? number : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]> : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]> }`[]\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:146

## Type Parameters

### T

`T` *extends* [`VerificationTokenGroupByArgs`](VerificationTokenGroupByArgs.md)
