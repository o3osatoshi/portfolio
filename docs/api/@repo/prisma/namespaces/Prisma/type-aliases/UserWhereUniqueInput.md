[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / UserWhereUniqueInput

# Type Alias: UserWhereUniqueInput

> **UserWhereUniqueInput** = [`AtLeast`](AtLeast.md)\<\{ `accounts?`: [`AccountListRelationFilter`](AccountListRelationFilter.md); `AND?`: [`UserWhereInput`](UserWhereInput.md) \| [`UserWhereInput`](UserWhereInput.md)[]; `Authenticator?`: [`AuthenticatorListRelationFilter`](AuthenticatorListRelationFilter.md); `createdAt?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"User"`\> \| `Date` \| `string`; `email?`: `string`; `emailVerified?`: [`DateTimeNullableFilter`](DateTimeNullableFilter.md)\<`"User"`\> \| `Date` \| `string` \| `null`; `id?`: `string`; `image?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"User"`\> \| `string` \| `null`; `name?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"User"`\> \| `string` \| `null`; `NOT?`: [`UserWhereInput`](UserWhereInput.md) \| [`UserWhereInput`](UserWhereInput.md)[]; `OR?`: [`UserWhereInput`](UserWhereInput.md)[]; `sessions?`: [`SessionListRelationFilter`](SessionListRelationFilter.md); `transactions?`: [`TransactionListRelationFilter`](TransactionListRelationFilter.md); `updatedAt?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"User"`\> \| `Date` \| `string`; \}, `"id"` \| `"email"`\>

Defined in: packages/prisma/generated/prisma/models/User.ts:220
