[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountWhereUniqueInput

# Type Alias: AccountWhereUniqueInput

> **AccountWhereUniqueInput** = [`AtLeast`](AtLeast.md)\<\{ `access_token?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`; `AND?`: [`AccountWhereInput`](AccountWhereInput.md) \| [`AccountWhereInput`](AccountWhereInput.md)[]; `createdAt?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"Account"`\> \| `Date` \| `string`; `expires_at?`: [`IntNullableFilter`](IntNullableFilter.md)\<`"Account"`\> \| `number` \| `null`; `id_token?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`; `NOT?`: [`AccountWhereInput`](AccountWhereInput.md) \| [`AccountWhereInput`](AccountWhereInput.md)[]; `OR?`: [`AccountWhereInput`](AccountWhereInput.md)[]; `provider?`: [`StringFilter`](StringFilter.md)\<`"Account"`\> \| `string`; `provider_providerAccountId?`: [`AccountProviderProviderAccountIdCompoundUniqueInput`](AccountProviderProviderAccountIdCompoundUniqueInput.md); `providerAccountId?`: [`StringFilter`](StringFilter.md)\<`"Account"`\> \| `string`; `refresh_token?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`; `scope?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`; `session_state?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`; `token_type?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`; `type?`: [`StringFilter`](StringFilter.md)\<`"Account"`\> \| `string`; `updatedAt?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"Account"`\> \| `Date` \| `string`; `user?`: [`XOR`](XOR.md)\<[`UserScalarRelationFilter`](UserScalarRelationFilter.md), [`UserWhereInput`](UserWhereInput.md)\>; `userId?`: [`StringFilter`](StringFilter.md)\<`"Account"`\> \| `string`; \}, `"provider_providerAccountId"`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:303
