[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / UserWhereInput

# Type Alias: UserWhereInput

> **UserWhereInput** = `object`

Defined in: packages/prisma/generated/prisma/models/User.ts:190

## Properties

### accounts?

> `optional` **accounts**: [`AccountListRelationFilter`](AccountListRelationFilter.md)

Defined in: packages/prisma/generated/prisma/models/User.ts:201

***

### AND?

> `optional` **AND**: `Prisma.UserWhereInput` \| `Prisma.UserWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/User.ts:191

***

### Authenticator?

> `optional` **Authenticator**: [`AuthenticatorListRelationFilter`](AuthenticatorListRelationFilter.md)

Defined in: packages/prisma/generated/prisma/models/User.ts:203

***

### createdAt?

> `optional` **createdAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"User"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/User.ts:199

***

### email?

> `optional` **email**: [`StringFilter`](StringFilter.md)\<`"User"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/User.ts:196

***

### emailVerified?

> `optional` **emailVerified**: [`DateTimeNullableFilter`](DateTimeNullableFilter.md)\<`"User"`\> \| `Date` \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:197

***

### id?

> `optional` **id**: [`StringFilter`](StringFilter.md)\<`"User"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/User.ts:194

***

### image?

> `optional` **image**: [`StringNullableFilter`](StringNullableFilter.md)\<`"User"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:198

***

### name?

> `optional` **name**: [`StringNullableFilter`](StringNullableFilter.md)\<`"User"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:195

***

### NOT?

> `optional` **NOT**: `Prisma.UserWhereInput` \| `Prisma.UserWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/User.ts:193

***

### OR?

> `optional` **OR**: `Prisma.UserWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/User.ts:192

***

### sessions?

> `optional` **sessions**: [`SessionListRelationFilter`](SessionListRelationFilter.md)

Defined in: packages/prisma/generated/prisma/models/User.ts:202

***

### transactions?

> `optional` **transactions**: [`TransactionListRelationFilter`](TransactionListRelationFilter.md)

Defined in: packages/prisma/generated/prisma/models/User.ts:204

***

### updatedAt?

> `optional` **updatedAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"User"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/User.ts:200
