[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionWhereInput

# Type Alias: SessionWhereInput

> **SessionWhereInput** = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:176

## Properties

### AND?

> `optional` **AND**: `Prisma.SessionWhereInput` \| `Prisma.SessionWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:177

***

### createdAt?

> `optional` **createdAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Session"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Session.ts:183

***

### expires?

> `optional` **expires**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Session"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Session.ts:182

***

### NOT?

> `optional` **NOT**: `Prisma.SessionWhereInput` \| `Prisma.SessionWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:179

***

### OR?

> `optional` **OR**: `Prisma.SessionWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:178

***

### sessionToken?

> `optional` **sessionToken**: [`StringFilter`](StringFilter.md)\<`"Session"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Session.ts:180

***

### updatedAt?

> `optional` **updatedAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Session"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Session.ts:184

***

### user?

> `optional` **user**: [`XOR`](XOR.md)\<[`UserScalarRelationFilter`](UserScalarRelationFilter.md), [`UserWhereInput`](UserWhereInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:185

***

### userId?

> `optional` **userId**: [`StringFilter`](StringFilter.md)\<`"Session"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Session.ts:181
