[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionWhereInput

# Type Alias: TransactionWhereInput

> **TransactionWhereInput** = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:270

## Properties

### amount?

> `optional` **amount**: [`DecimalFilter`](DecimalFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:277

***

### AND?

> `optional` **AND**: `Prisma.TransactionWhereInput` \| `Prisma.TransactionWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:271

***

### createdAt?

> `optional` **createdAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Transaction"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:284

***

### currency?

> `optional` **currency**: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:279

***

### datetime?

> `optional` **datetime**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Transaction"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:276

***

### fee?

> `optional` **fee**: [`DecimalNullableFilter`](DecimalNullableFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:281

***

### feeCurrency?

> `optional` **feeCurrency**: [`StringNullableFilter`](StringNullableFilter.md)\<`"Transaction"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:282

***

### id?

> `optional` **id**: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:274

***

### NOT?

> `optional` **NOT**: `Prisma.TransactionWhereInput` \| `Prisma.TransactionWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:273

***

### OR?

> `optional` **OR**: `Prisma.TransactionWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:272

***

### price?

> `optional` **price**: [`DecimalFilter`](DecimalFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:278

***

### profitLoss?

> `optional` **profitLoss**: [`DecimalNullableFilter`](DecimalNullableFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:280

***

### type?

> `optional` **type**: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:275

***

### updatedAt?

> `optional` **updatedAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Transaction"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:285

***

### user?

> `optional` **user**: [`XOR`](XOR.md)\<[`UserScalarRelationFilter`](UserScalarRelationFilter.md), [`UserWhereInput`](UserWhereInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:286

***

### userId?

> `optional` **userId**: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:283
