[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountWhereInput

# Type Alias: AccountWhereInput

> **AccountWhereInput** = `object`

Defined in: packages/prisma/generated/prisma/models/Account.ts:266

## Properties

### access\_token?

> `optional` **access\_token**: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:275

***

### AND?

> `optional` **AND**: `Prisma.AccountWhereInput` \| `Prisma.AccountWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Account.ts:267

***

### createdAt?

> `optional` **createdAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Account"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Account.ts:281

***

### expires\_at?

> `optional` **expires\_at**: [`IntNullableFilter`](IntNullableFilter.md)\<`"Account"`\> \| `number` \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:276

***

### id\_token?

> `optional` **id\_token**: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:279

***

### NOT?

> `optional` **NOT**: `Prisma.AccountWhereInput` \| `Prisma.AccountWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Account.ts:269

***

### OR?

> `optional` **OR**: `Prisma.AccountWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Account.ts:268

***

### provider?

> `optional` **provider**: [`StringFilter`](StringFilter.md)\<`"Account"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Account.ts:272

***

### providerAccountId?

> `optional` **providerAccountId**: [`StringFilter`](StringFilter.md)\<`"Account"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Account.ts:273

***

### refresh\_token?

> `optional` **refresh\_token**: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:274

***

### scope?

> `optional` **scope**: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:278

***

### session\_state?

> `optional` **session\_state**: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:280

***

### token\_type?

> `optional` **token\_type**: [`StringNullableFilter`](StringNullableFilter.md)\<`"Account"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:277

***

### type?

> `optional` **type**: [`StringFilter`](StringFilter.md)\<`"Account"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Account.ts:271

***

### updatedAt?

> `optional` **updatedAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Account"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Account.ts:282

***

### user?

> `optional` **user**: [`XOR`](XOR.md)\<[`UserScalarRelationFilter`](UserScalarRelationFilter.md), [`UserWhereInput`](UserWhereInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:283

***

### userId?

> `optional` **userId**: [`StringFilter`](StringFilter.md)\<`"Account"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Account.ts:270
