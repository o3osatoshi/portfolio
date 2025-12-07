[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorDelegate

# Interface: AuthenticatorDelegate\<ExtArgs, GlobalOmitOptions\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:675

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

### GlobalOmitOptions

`GlobalOmitOptions` = \{ \}

## Indexable

\[`K`: `symbol`\]: `object`

## Properties

### fields

> `readonly` **fields**: [`AuthenticatorFieldRefs`](AuthenticatorFieldRefs.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1047

Fields of the Authenticator model

## Methods

### aggregate()

> **aggregate**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetAuthenticatorAggregateType`](../type-aliases/GetAuthenticatorAggregateType.md)\<`T`\>\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:966

Allows you to perform aggregations operations on a Authenticator.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorAggregateArgs`](../type-aliases/AuthenticatorAggregateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`Subset`](../type-aliases/Subset.md)\<`T`, [`AuthenticatorAggregateArgs`](../type-aliases/AuthenticatorAggregateArgs.md)\>

Select which aggregations you would like to apply and on what fields.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetAuthenticatorAggregateType`](../type-aliases/GetAuthenticatorAggregateType.md)\<`T`\>\>

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

> **count**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof AuthenticatorCountAggregateOutputType ? AuthenticatorCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:932

Count the number of Authenticators.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorCountArgs`](../type-aliases/AuthenticatorCountArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`Subset`](../type-aliases/Subset.md)\<`T`, [`AuthenticatorCountArgs`](../type-aliases/AuthenticatorCountArgs.md)\<`DefaultArgs`\>\>

Arguments to filter Authenticators to count.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof AuthenticatorCountAggregateOutputType ? AuthenticatorCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

#### Example

```ts
// Count the number of Authenticators
const count = await prisma.authenticator.count({
  where: {
    // ... the filter for the Authenticators we want to count
  }
})
```

***

### create()

> **create**\<`T`\>(`args`): [`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:765

Create a Authenticator.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorCreateArgs`](../type-aliases/AuthenticatorCreateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorCreateArgs`](../type-aliases/AuthenticatorCreateArgs.md)\<`ExtArgs`\>\>

Arguments to create a Authenticator.

#### Returns

[`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Create one Authenticator
const Authenticator = await prisma.authenticator.create({
  data: {
    // ... data to create a Authenticator
  }
})
```

***

### createMany()

> **createMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:779

Create many Authenticators.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorCreateManyArgs`](../type-aliases/AuthenticatorCreateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorCreateManyArgs`](../type-aliases/AuthenticatorCreateManyArgs.md)\<`ExtArgs`\>\>

Arguments to create many Authenticators.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Create many Authenticators
const authenticator = await prisma.authenticator.createMany({
  data: [
    // ... provide data here
  ]
})
```

***

### createManyAndReturn()

> **createManyAndReturn**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:803

Create many Authenticators and returns the data saved in the database.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorCreateManyAndReturnArgs`](../type-aliases/AuthenticatorCreateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorCreateManyAndReturnArgs`](../type-aliases/AuthenticatorCreateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to create many Authenticators.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Create many Authenticators
const authenticator = await prisma.authenticator.createManyAndReturn({
  data: [
    // ... provide data here
  ]
})

// Create many Authenticators and only return the `credentialID`
const authenticatorWithCredentialIDOnly = await prisma.authenticator.createManyAndReturn({
  select: { credentialID: true },
  data: [
    // ... provide data here
  ]
})
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined
```

***

### delete()

> **delete**\<`T`\>(`args`): [`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:817

Delete a Authenticator.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorDeleteArgs`](../type-aliases/AuthenticatorDeleteArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorDeleteArgs`](../type-aliases/AuthenticatorDeleteArgs.md)\<`ExtArgs`\>\>

Arguments to delete one Authenticator.

#### Returns

[`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Delete one Authenticator
const Authenticator = await prisma.authenticator.delete({
  where: {
    // ... filter to delete one Authenticator
  }
})
```

***

### deleteMany()

> **deleteMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:848

Delete zero or more Authenticators.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorDeleteManyArgs`](../type-aliases/AuthenticatorDeleteManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorDeleteManyArgs`](../type-aliases/AuthenticatorDeleteManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter Authenticators to delete.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Delete a few Authenticators
const { count } = await prisma.authenticator.deleteMany({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirst()

> **findFirst**\<`T`\>(`args?`): [`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\> \| `null`, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:717

Find the first Authenticator that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorFindFirstArgs`](../type-aliases/AuthenticatorFindFirstArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorFindFirstArgs`](../type-aliases/AuthenticatorFindFirstArgs.md)\<`ExtArgs`\>\>

Arguments to find a Authenticator

#### Returns

[`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\> \| `null`, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Authenticator
const authenticator = await prisma.authenticator.findFirst({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirstOrThrow()

> **findFirstOrThrow**\<`T`\>(`args?`): [`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:733

Find the first Authenticator that matches the filter or
throw `PrismaKnownClientError` with `P2025` code if no matches were found.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorFindFirstOrThrowArgs`](../type-aliases/AuthenticatorFindFirstOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorFindFirstOrThrowArgs`](../type-aliases/AuthenticatorFindFirstOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a Authenticator

#### Returns

[`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Authenticator
const authenticator = await prisma.authenticator.findFirstOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### findMany()

> **findMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:751

Find zero or more Authenticators that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorFindManyArgs`](../type-aliases/AuthenticatorFindManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorFindManyArgs`](../type-aliases/AuthenticatorFindManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter and select certain fields only.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Get all Authenticators
const authenticators = await prisma.authenticator.findMany()

// Get first 10 Authenticators
const authenticators = await prisma.authenticator.findMany({ take: 10 })

// Only select the `credentialID`
const authenticatorWithCredentialIDOnly = await prisma.authenticator.findMany({ select: { credentialID: true } })
```

***

### findUnique()

> **findUnique**\<`T`\>(`args`): [`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\> \| `null`, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:688

Find zero or one Authenticator that matches the filter.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorFindUniqueArgs`](../type-aliases/AuthenticatorFindUniqueArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorFindUniqueArgs`](../type-aliases/AuthenticatorFindUniqueArgs.md)\<`ExtArgs`\>\>

Arguments to find a Authenticator

#### Returns

[`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\> \| `null`, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Authenticator
const authenticator = await prisma.authenticator.findUnique({
  where: {
    // ... provide filter here
  }
})
```

***

### findUniqueOrThrow()

> **findUniqueOrThrow**\<`T`\>(`args`): [`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:702

Find one Authenticator that matches the filter or throw an error with `error.code='P2025'`
if no matches were found.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorFindUniqueOrThrowArgs`](../type-aliases/AuthenticatorFindUniqueOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorFindUniqueOrThrowArgs`](../type-aliases/AuthenticatorFindUniqueOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a Authenticator

#### Returns

[`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Authenticator
const authenticator = await prisma.authenticator.findUniqueOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### groupBy()

> **groupBy**\<`T`, `HasSelectOrTake`, `OrderByArg`, `OrderFields`, `ByFields`, `ByValid`, `HavingFields`, `HavingValid`, `ByEmpty`, `InputErrors`\>(`args`): `object` *extends* `InputErrors` ? `GetAuthenticatorGroupByPayload`\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:986

Group by Authenticator.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorGroupByArgs`](../type-aliases/AuthenticatorGroupByArgs.md)\<`DefaultArgs`\>

##### HasSelectOrTake

`HasSelectOrTake` *extends* `0` \| `1`

##### OrderByArg

`OrderByArg` *extends* \{ `orderBy`: [`AuthenticatorOrderByWithAggregationInput`](../type-aliases/AuthenticatorOrderByWithAggregationInput.md) \| [`AuthenticatorOrderByWithAggregationInput`](../type-aliases/AuthenticatorOrderByWithAggregationInput.md)[] \| `undefined`; \} \| \{ `orderBy?`: [`AuthenticatorOrderByWithAggregationInput`](../type-aliases/AuthenticatorOrderByWithAggregationInput.md) \| [`AuthenticatorOrderByWithAggregationInput`](../type-aliases/AuthenticatorOrderByWithAggregationInput.md)[]; \}

##### OrderFields

`OrderFields` *extends* `"userId"` \| `"providerAccountId"` \| `"credentialID"` \| `"credentialPublicKey"` \| `"counter"` \| `"credentialDeviceType"` \| `"credentialBackedUp"` \| `"transports"`

##### ByFields

`ByFields` *extends* [`AuthenticatorScalarFieldEnum`](../type-aliases/AuthenticatorScalarFieldEnum.md)

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

\{ \[key in string \| number \| symbol\]: key extends keyof AuthenticatorGroupByArgs\<DefaultArgs\> ? T\[key\<key\>\] : never \} & `OrderByArg` & `InputErrors`

Group by arguments.

#### Returns

`object` *extends* `InputErrors` ? `GetAuthenticatorGroupByPayload`\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

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

> **update**\<`T`\>(`args`): [`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:834

Update one Authenticator.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorUpdateArgs`](../type-aliases/AuthenticatorUpdateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorUpdateArgs`](../type-aliases/AuthenticatorUpdateArgs.md)\<`ExtArgs`\>\>

Arguments to update one Authenticator.

#### Returns

[`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update one Authenticator
const authenticator = await prisma.authenticator.update({
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

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:867

Update zero or more Authenticators.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorUpdateManyArgs`](../type-aliases/AuthenticatorUpdateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorUpdateManyArgs`](../type-aliases/AuthenticatorUpdateManyArgs.md)\<`ExtArgs`\>\>

Arguments to update one or more rows.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Update many Authenticators
const authenticator = await prisma.authenticator.updateMany({
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

> **updateManyAndReturn**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:897

Update zero or more Authenticators and returns the data updated in the database.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorUpdateManyAndReturnArgs`](../type-aliases/AuthenticatorUpdateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorUpdateManyAndReturnArgs`](../type-aliases/AuthenticatorUpdateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to update many Authenticators.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Update many Authenticators
const authenticator = await prisma.authenticator.updateManyAndReturn({
  where: {
    // ... provide filter here
  },
  data: [
    // ... provide data here
  ]
})

// Update zero or more Authenticators and only return the `credentialID`
const authenticatorWithCredentialIDOnly = await prisma.authenticator.updateManyAndReturn({
  select: { credentialID: true },
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

> **upsert**\<`T`\>(`args`): [`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:916

Create or update one Authenticator.

#### Type Parameters

##### T

`T` *extends* [`AuthenticatorUpsertArgs`](../type-aliases/AuthenticatorUpsertArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AuthenticatorUpsertArgs`](../type-aliases/AuthenticatorUpsertArgs.md)\<`ExtArgs`\>\>

Arguments to update or create a Authenticator.

#### Returns

[`Prisma__AuthenticatorClient`](Prisma__AuthenticatorClient.md)\<`GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update or create a Authenticator
const authenticator = await prisma.authenticator.upsert({
  create: {
    // ... data to create a Authenticator
  },
  update: {
    // ... in case it already exists, update
  },
  where: {
    // ... the filter for the Authenticator we want to update
  }
})
```
