[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorWhereUniqueInput

# Type Alias: AuthenticatorWhereUniqueInput

> **AuthenticatorWhereUniqueInput** = [`AtLeast`](AtLeast.md)\<\{ `AND?`: [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md) \| [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md)[]; `counter?`: [`IntFilter`](IntFilter.md)\<`"Authenticator"`\> \| `number`; `credentialBackedUp?`: [`BoolFilter`](BoolFilter.md)\<`"Authenticator"`\> \| `boolean`; `credentialDeviceType?`: [`StringFilter`](StringFilter.md)\<`"Authenticator"`\> \| `string`; `credentialID?`: `string`; `credentialPublicKey?`: [`StringFilter`](StringFilter.md)\<`"Authenticator"`\> \| `string`; `NOT?`: [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md) \| [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md)[]; `OR?`: [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md)[]; `providerAccountId?`: [`StringFilter`](StringFilter.md)\<`"Authenticator"`\> \| `string`; `transports?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"Authenticator"`\> \| `string` \| `null`; `user?`: [`XOR`](XOR.md)\<[`UserScalarRelationFilter`](UserScalarRelationFilter.md), [`UserWhereInput`](UserWhereInput.md)\>; `userId?`: [`StringFilter`](StringFilter.md)\<`"Authenticator"`\> \| `string`; `userId_credentialID?`: [`AuthenticatorUserIdCredentialIDCompoundUniqueInput`](AuthenticatorUserIdCredentialIDCompoundUniqueInput.md); \}, `"userId_credentialID"` \| `"credentialID"`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:258
