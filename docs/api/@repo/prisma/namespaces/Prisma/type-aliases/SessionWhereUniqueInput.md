[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionWhereUniqueInput

# Type Alias: SessionWhereUniqueInput

> **SessionWhereUniqueInput** = [`AtLeast`](AtLeast.md)\<\{ `AND?`: [`SessionWhereInput`](SessionWhereInput.md) \| [`SessionWhereInput`](SessionWhereInput.md)[]; `createdAt?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"Session"`\> \| `Date` \| `string`; `expires?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"Session"`\> \| `Date` \| `string`; `NOT?`: [`SessionWhereInput`](SessionWhereInput.md) \| [`SessionWhereInput`](SessionWhereInput.md)[]; `OR?`: [`SessionWhereInput`](SessionWhereInput.md)[]; `sessionToken?`: `string`; `updatedAt?`: [`DateTimeFilter`](DateTimeFilter.md)\<`"Session"`\> \| `Date` \| `string`; `user?`: [`XOR`](XOR.md)\<[`UserScalarRelationFilter`](UserScalarRelationFilter.md), [`UserWhereInput`](UserWhereInput.md)\>; `userId?`: [`StringFilter`](StringFilter.md)\<`"Session"`\> \| `string`; \}, `"sessionToken"`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:197
