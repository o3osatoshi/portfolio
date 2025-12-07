[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / VerificationTokenDelegate

# Interface: VerificationTokenDelegate\<ExtArgs, GlobalOmitOptions\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:316

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

### GlobalOmitOptions

`GlobalOmitOptions` = \{ \}

## Indexable

\[`K`: `symbol`\]: `object`

## Properties

### fields

> `readonly` **fields**: [`VerificationTokenFieldRefs`](VerificationTokenFieldRefs.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:688

Fields of the VerificationToken model

## Methods

### aggregate()

> **aggregate**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetVerificationTokenAggregateType`](../type-aliases/GetVerificationTokenAggregateType.md)\<`T`\>\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:607

Allows you to perform aggregations operations on a VerificationToken.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenAggregateArgs`](../type-aliases/VerificationTokenAggregateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`Subset`](../type-aliases/Subset.md)\<`T`, [`VerificationTokenAggregateArgs`](../type-aliases/VerificationTokenAggregateArgs.md)\>

Select which aggregations you would like to apply and on what fields.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetVerificationTokenAggregateType`](../type-aliases/GetVerificationTokenAggregateType.md)\<`T`\>\>

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

> **count**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof VerificationTokenCountAggregateOutputType ? VerificationTokenCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:573

Count the number of VerificationTokens.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenCountArgs`](../type-aliases/VerificationTokenCountArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`Subset`](../type-aliases/Subset.md)\<`T`, [`VerificationTokenCountArgs`](../type-aliases/VerificationTokenCountArgs.md)\<`DefaultArgs`\>\>

Arguments to filter VerificationTokens to count.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof VerificationTokenCountAggregateOutputType ? VerificationTokenCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

#### Example

```ts
// Count the number of VerificationTokens
const count = await prisma.verificationToken.count({
  where: {
    // ... the filter for the VerificationTokens we want to count
  }
})
```

***

### create()

> **create**\<`T`\>(`args`): [`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:406

Create a VerificationToken.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenCreateArgs`](../type-aliases/VerificationTokenCreateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenCreateArgs`](../type-aliases/VerificationTokenCreateArgs.md)\<`ExtArgs`\>\>

Arguments to create a VerificationToken.

#### Returns

[`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Create one VerificationToken
const VerificationToken = await prisma.verificationToken.create({
  data: {
    // ... data to create a VerificationToken
  }
})
```

***

### createMany()

> **createMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:420

Create many VerificationTokens.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenCreateManyArgs`](../type-aliases/VerificationTokenCreateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenCreateManyArgs`](../type-aliases/VerificationTokenCreateManyArgs.md)\<`ExtArgs`\>\>

Arguments to create many VerificationTokens.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Create many VerificationTokens
const verificationToken = await prisma.verificationToken.createMany({
  data: [
    // ... provide data here
  ]
})
```

***

### createManyAndReturn()

> **createManyAndReturn**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:444

Create many VerificationTokens and returns the data saved in the database.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenCreateManyAndReturnArgs`](../type-aliases/VerificationTokenCreateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenCreateManyAndReturnArgs`](../type-aliases/VerificationTokenCreateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to create many VerificationTokens.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Create many VerificationTokens
const verificationToken = await prisma.verificationToken.createManyAndReturn({
  data: [
    // ... provide data here
  ]
})

// Create many VerificationTokens and only return the `identifier`
const verificationTokenWithIdentifierOnly = await prisma.verificationToken.createManyAndReturn({
  select: { identifier: true },
  data: [
    // ... provide data here
  ]
})
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined
```

***

### delete()

> **delete**\<`T`\>(`args`): [`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:458

Delete a VerificationToken.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenDeleteArgs`](../type-aliases/VerificationTokenDeleteArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenDeleteArgs`](../type-aliases/VerificationTokenDeleteArgs.md)\<`ExtArgs`\>\>

Arguments to delete one VerificationToken.

#### Returns

[`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Delete one VerificationToken
const VerificationToken = await prisma.verificationToken.delete({
  where: {
    // ... filter to delete one VerificationToken
  }
})
```

***

### deleteMany()

> **deleteMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:489

Delete zero or more VerificationTokens.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenDeleteManyArgs`](../type-aliases/VerificationTokenDeleteManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenDeleteManyArgs`](../type-aliases/VerificationTokenDeleteManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter VerificationTokens to delete.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Delete a few VerificationTokens
const { count } = await prisma.verificationToken.deleteMany({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirst()

> **findFirst**\<`T`\>(`args?`): [`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\> \| `null`, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:358

Find the first VerificationToken that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenFindFirstArgs`](../type-aliases/VerificationTokenFindFirstArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenFindFirstArgs`](../type-aliases/VerificationTokenFindFirstArgs.md)\<`ExtArgs`\>\>

Arguments to find a VerificationToken

#### Returns

[`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\> \| `null`, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one VerificationToken
const verificationToken = await prisma.verificationToken.findFirst({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirstOrThrow()

> **findFirstOrThrow**\<`T`\>(`args?`): [`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:374

Find the first VerificationToken that matches the filter or
throw `PrismaKnownClientError` with `P2025` code if no matches were found.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenFindFirstOrThrowArgs`](../type-aliases/VerificationTokenFindFirstOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenFindFirstOrThrowArgs`](../type-aliases/VerificationTokenFindFirstOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a VerificationToken

#### Returns

[`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one VerificationToken
const verificationToken = await prisma.verificationToken.findFirstOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### findMany()

> **findMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:392

Find zero or more VerificationTokens that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenFindManyArgs`](../type-aliases/VerificationTokenFindManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenFindManyArgs`](../type-aliases/VerificationTokenFindManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter and select certain fields only.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Get all VerificationTokens
const verificationTokens = await prisma.verificationToken.findMany()

// Get first 10 VerificationTokens
const verificationTokens = await prisma.verificationToken.findMany({ take: 10 })

// Only select the `identifier`
const verificationTokenWithIdentifierOnly = await prisma.verificationToken.findMany({ select: { identifier: true } })
```

***

### findUnique()

> **findUnique**\<`T`\>(`args`): [`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\> \| `null`, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:329

Find zero or one VerificationToken that matches the filter.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenFindUniqueArgs`](../type-aliases/VerificationTokenFindUniqueArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenFindUniqueArgs`](../type-aliases/VerificationTokenFindUniqueArgs.md)\<`ExtArgs`\>\>

Arguments to find a VerificationToken

#### Returns

[`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\> \| `null`, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one VerificationToken
const verificationToken = await prisma.verificationToken.findUnique({
  where: {
    // ... provide filter here
  }
})
```

***

### findUniqueOrThrow()

> **findUniqueOrThrow**\<`T`\>(`args`): [`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:343

Find one VerificationToken that matches the filter or throw an error with `error.code='P2025'`
if no matches were found.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenFindUniqueOrThrowArgs`](../type-aliases/VerificationTokenFindUniqueOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenFindUniqueOrThrowArgs`](../type-aliases/VerificationTokenFindUniqueOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a VerificationToken

#### Returns

[`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one VerificationToken
const verificationToken = await prisma.verificationToken.findUniqueOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### groupBy()

> **groupBy**\<`T`, `HasSelectOrTake`, `OrderByArg`, `OrderFields`, `ByFields`, `ByValid`, `HavingFields`, `HavingValid`, `ByEmpty`, `InputErrors`\>(`args`): `object` *extends* `InputErrors` ? `GetVerificationTokenGroupByPayload`\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:627

Group by VerificationToken.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenGroupByArgs`](../type-aliases/VerificationTokenGroupByArgs.md)\<`DefaultArgs`\>

##### HasSelectOrTake

`HasSelectOrTake` *extends* `0` \| `1`

##### OrderByArg

`OrderByArg` *extends* \{ `orderBy`: [`VerificationTokenOrderByWithAggregationInput`](../type-aliases/VerificationTokenOrderByWithAggregationInput.md) \| [`VerificationTokenOrderByWithAggregationInput`](../type-aliases/VerificationTokenOrderByWithAggregationInput.md)[] \| `undefined`; \} \| \{ `orderBy?`: [`VerificationTokenOrderByWithAggregationInput`](../type-aliases/VerificationTokenOrderByWithAggregationInput.md) \| [`VerificationTokenOrderByWithAggregationInput`](../type-aliases/VerificationTokenOrderByWithAggregationInput.md)[]; \}

##### OrderFields

`OrderFields` *extends* `"expires"` \| `"identifier"` \| `"token"`

##### ByFields

`ByFields` *extends* [`VerificationTokenScalarFieldEnum`](../type-aliases/VerificationTokenScalarFieldEnum.md)

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

\{ \[key in string \| number \| symbol\]: key extends keyof VerificationTokenGroupByArgs\<DefaultArgs\> ? T\[key\<key\>\] : never \} & `OrderByArg` & `InputErrors`

Group by arguments.

#### Returns

`object` *extends* `InputErrors` ? `GetVerificationTokenGroupByPayload`\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

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

> **update**\<`T`\>(`args`): [`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:475

Update one VerificationToken.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenUpdateArgs`](../type-aliases/VerificationTokenUpdateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenUpdateArgs`](../type-aliases/VerificationTokenUpdateArgs.md)\<`ExtArgs`\>\>

Arguments to update one VerificationToken.

#### Returns

[`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update one VerificationToken
const verificationToken = await prisma.verificationToken.update({
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

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:508

Update zero or more VerificationTokens.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenUpdateManyArgs`](../type-aliases/VerificationTokenUpdateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenUpdateManyArgs`](../type-aliases/VerificationTokenUpdateManyArgs.md)\<`ExtArgs`\>\>

Arguments to update one or more rows.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Update many VerificationTokens
const verificationToken = await prisma.verificationToken.updateMany({
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

> **updateManyAndReturn**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:538

Update zero or more VerificationTokens and returns the data updated in the database.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenUpdateManyAndReturnArgs`](../type-aliases/VerificationTokenUpdateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenUpdateManyAndReturnArgs`](../type-aliases/VerificationTokenUpdateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to update many VerificationTokens.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Update many VerificationTokens
const verificationToken = await prisma.verificationToken.updateManyAndReturn({
  where: {
    // ... provide filter here
  },
  data: [
    // ... provide data here
  ]
})

// Update zero or more VerificationTokens and only return the `identifier`
const verificationTokenWithIdentifierOnly = await prisma.verificationToken.updateManyAndReturn({
  select: { identifier: true },
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

> **upsert**\<`T`\>(`args`): [`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:557

Create or update one VerificationToken.

#### Type Parameters

##### T

`T` *extends* [`VerificationTokenUpsertArgs`](../type-aliases/VerificationTokenUpsertArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`VerificationTokenUpsertArgs`](../type-aliases/VerificationTokenUpsertArgs.md)\<`ExtArgs`\>\>

Arguments to update or create a VerificationToken.

#### Returns

[`Prisma__VerificationTokenClient`](Prisma__VerificationTokenClient.md)\<`GetFindResult`\<[`$VerificationTokenPayload`](../type-aliases/$VerificationTokenPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update or create a VerificationToken
const verificationToken = await prisma.verificationToken.upsert({
  create: {
    // ... data to create a VerificationToken
  },
  update: {
    // ... in case it already exists, update
  },
  where: {
    // ... the filter for the VerificationToken we want to update
  }
})
```
