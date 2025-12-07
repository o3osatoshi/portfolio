[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionWhereInput

# Type Alias: TransactionWhereInput

> **TransactionWhereInput** = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:271

## Properties

### amount?

> `optional` **amount**: [`DecimalFilter`](DecimalFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:278

***

### AND?

> `optional` **AND**: `Prisma.TransactionWhereInput` \| `Prisma.TransactionWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:272

***

### createdAt?

> `optional` **createdAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Transaction"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:285

***

### currency?

> `optional` **currency**: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:280

***

### datetime?

> `optional` **datetime**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Transaction"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:277

***

### fee?

> `optional` **fee**: [`DecimalNullableFilter`](DecimalNullableFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:282

***

### feeCurrency?

> `optional` **feeCurrency**: [`StringNullableFilter`](StringNullableFilter.md)\<`"Transaction"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:283

***

### id?

> `optional` **id**: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:275

***

### NOT?

> `optional` **NOT**: `Prisma.TransactionWhereInput` \| `Prisma.TransactionWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:274

***

### OR?

> `optional` **OR**: `Prisma.TransactionWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:273

***

### price?

> `optional` **price**: [`DecimalFilter`](DecimalFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:279

***

### profitLoss?

> `optional` **profitLoss**: [`DecimalNullableFilter`](DecimalNullableFilter.md)\<`"Transaction"`\> \| `runtime.Decimal` \| `runtime.DecimalJsLike` \| `number` \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:281

***

### type?

> `optional` **type**: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:276

***

### updatedAt?

> `optional` **updatedAt**: [`DateTimeFilter`](DateTimeFilter.md)\<`"Transaction"`\> \| `Date` \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:286

***

### user?

> `optional` **user**: [`XOR`](XOR.md)\<[`UserScalarRelationFilter`](UserScalarRelationFilter.md), [`UserWhereInput`](UserWhereInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:287

***

### userId?

> `optional` **userId**: [`StringFilter`](StringFilter.md)\<`"Transaction"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:284
