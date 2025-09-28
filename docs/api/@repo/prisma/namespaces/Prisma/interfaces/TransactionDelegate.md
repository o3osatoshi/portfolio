[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionDelegate

# Interface: TransactionDelegate\<ExtArgs, GlobalOmitOptions\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:838

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

### GlobalOmitOptions

`GlobalOmitOptions` = \{ \}

## Indexable

\[`K`: `symbol`\]: `object`

## Properties

### fields

> `readonly` **fields**: [`TransactionFieldRefs`](TransactionFieldRefs.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1210

Fields of the Transaction model

## Methods

### aggregate()

> **aggregate**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetTransactionAggregateType`](../type-aliases/GetTransactionAggregateType.md)\<`T`\>\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1129

Allows you to perform aggregations operations on a Transaction.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`TransactionAggregateArgs`](../type-aliases/TransactionAggregateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`Subset`](../type-aliases/Subset.md)\<`T`, [`TransactionAggregateArgs`](../type-aliases/TransactionAggregateArgs.md)\>

Select which aggregations you would like to apply and on what fields.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetTransactionAggregateType`](../type-aliases/GetTransactionAggregateType.md)\<`T`\>\>

#### Example

```ts
// Ordered by age ascending
// Where email contains prisma.io
// Limited to the 10 users
const aggregations = await prisma.user.aggregate({
  _avg: {
    age: true,
  },
  where: {
    email: {
      contains: "prisma.io",
    },
  },
  orderBy: {
    age: "asc",
  },
  take: 10,
})
```

***

### count()

> **count**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof TransactionCountAggregateOutputType ? TransactionCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1095

Count the number of Transactions.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`TransactionCountArgs`](../type-aliases/TransactionCountArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`Subset`](../type-aliases/Subset.md)\<`T`, [`TransactionCountArgs`](../type-aliases/TransactionCountArgs.md)\<`DefaultArgs`\>\>

Arguments to filter Transactions to count.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof TransactionCountAggregateOutputType ? TransactionCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

#### Example

```ts
// Count the number of Transactions
const count = await prisma.transaction.count({
  where: {
    // ... the filter for the Transactions we want to count
  }
})
```

***

### create()

> **create**\<`T`\>(`args`): [`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:928

Create a Transaction.

#### Type Parameters

##### T

`T` *extends* [`TransactionCreateArgs`](../type-aliases/TransactionCreateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionCreateArgs`](../type-aliases/TransactionCreateArgs.md)\<`ExtArgs`\>\>

Arguments to create a Transaction.

#### Returns

[`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Create one Transaction
const Transaction = await prisma.transaction.create({
  data: {
    // ... data to create a Transaction
  }
})
```

***

### createMany()

> **createMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:942

Create many Transactions.

#### Type Parameters

##### T

`T` *extends* [`TransactionCreateManyArgs`](../type-aliases/TransactionCreateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionCreateManyArgs`](../type-aliases/TransactionCreateManyArgs.md)\<`ExtArgs`\>\>

Arguments to create many Transactions.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Create many Transactions
const transaction = await prisma.transaction.createMany({
  data: [
    // ... provide data here
  ]
})
```

***

### createManyAndReturn()

> **createManyAndReturn**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:966

Create many Transactions and returns the data saved in the database.

#### Type Parameters

##### T

`T` *extends* [`TransactionCreateManyAndReturnArgs`](../type-aliases/TransactionCreateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionCreateManyAndReturnArgs`](../type-aliases/TransactionCreateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to create many Transactions.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Create many Transactions
const transaction = await prisma.transaction.createManyAndReturn({
  data: [
    // ... provide data here
  ]
})

// Create many Transactions and only return the `id`
const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
  select: { id: true },
  data: [
    // ... provide data here
  ]
})
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined
```

***

### delete()

> **delete**\<`T`\>(`args`): [`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:980

Delete a Transaction.

#### Type Parameters

##### T

`T` *extends* [`TransactionDeleteArgs`](../type-aliases/TransactionDeleteArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionDeleteArgs`](../type-aliases/TransactionDeleteArgs.md)\<`ExtArgs`\>\>

Arguments to delete one Transaction.

#### Returns

[`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Delete one Transaction
const Transaction = await prisma.transaction.delete({
  where: {
    // ... filter to delete one Transaction
  }
})
```

***

### deleteMany()

> **deleteMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1011

Delete zero or more Transactions.

#### Type Parameters

##### T

`T` *extends* [`TransactionDeleteManyArgs`](../type-aliases/TransactionDeleteManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionDeleteManyArgs`](../type-aliases/TransactionDeleteManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter Transactions to delete.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Delete a few Transactions
const { count } = await prisma.transaction.deleteMany({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirst()

> **findFirst**\<`T`\>(`args?`): [`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`null` \| `GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:880

Find the first Transaction that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`TransactionFindFirstArgs`](../type-aliases/TransactionFindFirstArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionFindFirstArgs`](../type-aliases/TransactionFindFirstArgs.md)\<`ExtArgs`\>\>

Arguments to find a Transaction

#### Returns

[`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`null` \| `GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Transaction
const transaction = await prisma.transaction.findFirst({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirstOrThrow()

> **findFirstOrThrow**\<`T`\>(`args?`): [`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:896

Find the first Transaction that matches the filter or
throw `PrismaKnownClientError` with `P2025` code if no matches were found.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`TransactionFindFirstOrThrowArgs`](../type-aliases/TransactionFindFirstOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionFindFirstOrThrowArgs`](../type-aliases/TransactionFindFirstOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a Transaction

#### Returns

[`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Transaction
const transaction = await prisma.transaction.findFirstOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### findMany()

> **findMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:914

Find zero or more Transactions that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`TransactionFindManyArgs`](../type-aliases/TransactionFindManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionFindManyArgs`](../type-aliases/TransactionFindManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter and select certain fields only.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Get all Transactions
const transactions = await prisma.transaction.findMany()

// Get first 10 Transactions
const transactions = await prisma.transaction.findMany({ take: 10 })

// Only select the `id`
const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
```

***

### findUnique()

> **findUnique**\<`T`\>(`args`): [`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`null` \| `GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:851

Find zero or one Transaction that matches the filter.

#### Type Parameters

##### T

`T` *extends* [`TransactionFindUniqueArgs`](../type-aliases/TransactionFindUniqueArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionFindUniqueArgs`](../type-aliases/TransactionFindUniqueArgs.md)\<`ExtArgs`\>\>

Arguments to find a Transaction

#### Returns

[`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`null` \| `GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Transaction
const transaction = await prisma.transaction.findUnique({
  where: {
    // ... provide filter here
  }
})
```

***

### findUniqueOrThrow()

> **findUniqueOrThrow**\<`T`\>(`args`): [`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:865

Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
if no matches were found.

#### Type Parameters

##### T

`T` *extends* [`TransactionFindUniqueOrThrowArgs`](../type-aliases/TransactionFindUniqueOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionFindUniqueOrThrowArgs`](../type-aliases/TransactionFindUniqueOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a Transaction

#### Returns

[`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Transaction
const transaction = await prisma.transaction.findUniqueOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### groupBy()

> **groupBy**\<`T`, `HasSelectOrTake`, `OrderByArg`, `OrderFields`, `ByFields`, `ByValid`, `HavingFields`, `HavingValid`, `ByEmpty`, `InputErrors`\>(`args`): `object` *extends* `InputErrors` ? `GetTransactionGroupByPayload`\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1149

Group by Transaction.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`TransactionGroupByArgs`](../type-aliases/TransactionGroupByArgs.md)\<`DefaultArgs`\>

##### HasSelectOrTake

`HasSelectOrTake` *extends* `0` \| `1`

##### OrderByArg

`OrderByArg` *extends* \{ `orderBy`: `undefined` \| [`TransactionOrderByWithAggregationInput`](../type-aliases/TransactionOrderByWithAggregationInput.md) \| [`TransactionOrderByWithAggregationInput`](../type-aliases/TransactionOrderByWithAggregationInput.md)[]; \} \| \{ `orderBy?`: [`TransactionOrderByWithAggregationInput`](../type-aliases/TransactionOrderByWithAggregationInput.md) \| [`TransactionOrderByWithAggregationInput`](../type-aliases/TransactionOrderByWithAggregationInput.md)[]; \}

##### OrderFields

`OrderFields` *extends* `"createdAt"` \| `"updatedAt"` \| `"id"` \| `"amount"` \| `"currency"` \| `"datetime"` \| `"fee"` \| `"feeCurrency"` \| `"price"` \| `"profitLoss"` \| `"type"` \| `"userId"`

##### ByFields

`ByFields` *extends* [`TransactionScalarFieldEnum`](../type-aliases/TransactionScalarFieldEnum.md)

##### ByValid

`ByValid` *extends* `0` \| `1`

##### HavingFields

`HavingFields` *extends* `string` \| `number` \| `symbol`

##### HavingValid

`HavingValid`

##### ByEmpty

`ByEmpty` *extends* `0` \| `1`

##### InputErrors

`InputErrors`

#### Parameters

##### args

\{ \[key in string \| number \| symbol\]: key extends keyof TransactionGroupByArgs\<DefaultArgs\> ? T\[key\<key\>\] : never \} & `OrderByArg` & `InputErrors`

Group by arguments.

#### Returns

`object` *extends* `InputErrors` ? `GetTransactionGroupByPayload`\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

#### Example

```ts
// Group by city, order by createdAt, get count
const result = await prisma.user.groupBy({
  by: ['city', 'createdAt'],
  orderBy: {
    createdAt: true
  },
  _count: {
    _all: true
  },
})
```

***

### update()

> **update**\<`T`\>(`args`): [`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:997

Update one Transaction.

#### Type Parameters

##### T

`T` *extends* [`TransactionUpdateArgs`](../type-aliases/TransactionUpdateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionUpdateArgs`](../type-aliases/TransactionUpdateArgs.md)\<`ExtArgs`\>\>

Arguments to update one Transaction.

#### Returns

[`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update one Transaction
const transaction = await prisma.transaction.update({
  where: {
    // ... provide filter here
  },
  data: {
    // ... provide data here
  }
})
```

***

### updateMany()

> **updateMany**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1030

Update zero or more Transactions.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`TransactionUpdateManyArgs`](../type-aliases/TransactionUpdateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionUpdateManyArgs`](../type-aliases/TransactionUpdateManyArgs.md)\<`ExtArgs`\>\>

Arguments to update one or more rows.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Update many Transactions
const transaction = await prisma.transaction.updateMany({
  where: {
    // ... provide filter here
  },
  data: {
    // ... provide data here
  }
})
```

***

### updateManyAndReturn()

> **updateManyAndReturn**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1060

Update zero or more Transactions and returns the data updated in the database.

#### Type Parameters

##### T

`T` *extends* [`TransactionUpdateManyAndReturnArgs`](../type-aliases/TransactionUpdateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionUpdateManyAndReturnArgs`](../type-aliases/TransactionUpdateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to update many Transactions.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Update many Transactions
const transaction = await prisma.transaction.updateManyAndReturn({
  where: {
    // ... provide filter here
  },
  data: [
    // ... provide data here
  ]
})

// Update zero or more Transactions and only return the `id`
const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
  select: { id: true },
  where: {
    // ... provide filter here
  },
  data: [
    // ... provide data here
  ]
})
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined
```

***

### upsert()

> **upsert**\<`T`\>(`args`): [`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1079

Create or update one Transaction.

#### Type Parameters

##### T

`T` *extends* [`TransactionUpsertArgs`](../type-aliases/TransactionUpsertArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`TransactionUpsertArgs`](../type-aliases/TransactionUpsertArgs.md)\<`ExtArgs`\>\>

Arguments to update or create a Transaction.

#### Returns

[`Prisma__TransactionClient`](Prisma__TransactionClient.md)\<`GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update or create a Transaction
const transaction = await prisma.transaction.upsert({
  create: {
    // ... data to create a Transaction
  },
  update: {
    // ... in case it already exists, update
  },
  where: {
    // ... the filter for the Transaction we want to update
  }
})
```
