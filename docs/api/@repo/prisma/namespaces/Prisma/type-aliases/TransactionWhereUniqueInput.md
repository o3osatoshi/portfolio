[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionWhereUniqueInput

# Type Alias: TransactionWhereUniqueInput

> **TransactionWhereUniqueInput** = [`AtLeast`](AtLeast.md)\<\{ `amount?`: [`DecimalFilter`](DecimalFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string`; `AND?`: [`TransactionWhereInput`](TransactionWhereInput.md) \| [`TransactionWhereInput`](TransactionWhereInput.md)[]; `createdAt?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"Transaction"`\> \| `Date` \| `string`; `currency?`: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`; `datetime?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"Transaction"`\> \| `Date` \| `string`; `fee?`: [`DecimalNullableFilter`](DecimalNullableFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string` \| `null`; `feeCurrency?`: [`StringNullableFilter`](StringNullableFilter.md)\<`"Transaction"`\> \| `string` \| `null`; `id?`: `string`; `NOT?`: [`TransactionWhereInput`](TransactionWhereInput.md) \| [`TransactionWhereInput`](TransactionWhereInput.md)[]; `OR?`: [`TransactionWhereInput`](TransactionWhereInput.md)[]; `price?`: [`DecimalFilter`](DecimalFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string`; `profitLoss?`: [`DecimalNullableFilter`](DecimalNullableFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string` \| `null`; `type?`: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`; `updatedAt?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"Transaction"`\> \| `Date` \| `string`; `user?`: [`XOR`](XOR.md)\<[`UserScalarRelationFilter`](UserScalarRelationFilter.md), [`UserWhereInput`](UserWhereInput.md)\>; `userId?`: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`; \}, `"id"`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:305
