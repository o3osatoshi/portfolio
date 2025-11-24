[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionDelegate

# Interface: SessionDelegate\<ExtArgs, GlobalOmitOptions\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:510

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

### GlobalOmitOptions

`GlobalOmitOptions` = \{ \}

## Indexable

\[`K`: `symbol`\]: `object`

## Properties

### fields

> `readonly` **fields**: [`SessionFieldRefs`](SessionFieldRefs.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:882

Fields of the Session model

## Methods

### aggregate()

> **aggregate**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetSessionAggregateType`](../type-aliases/GetSessionAggregateType.md)\<`T`\>\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:801

Allows you to perform aggregations operations on a Session.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`SessionAggregateArgs`](../type-aliases/SessionAggregateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`Subset`](../type-aliases/Subset.md)\<`T`, [`SessionAggregateArgs`](../type-aliases/SessionAggregateArgs.md)\>

Select which aggregations you would like to apply and on what fields.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetSessionAggregateType`](../type-aliases/GetSessionAggregateType.md)\<`T`\>\>

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

> **count**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof SessionCountAggregateOutputType ? SessionCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:767

Count the number of Sessions.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`SessionCountArgs`](../type-aliases/SessionCountArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`Subset`](../type-aliases/Subset.md)\<`T`, [`SessionCountArgs`](../type-aliases/SessionCountArgs.md)\<`DefaultArgs`\>\>

Arguments to filter Sessions to count.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof SessionCountAggregateOutputType ? SessionCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

#### Example

```ts
// Count the number of Sessions
const count = await prisma.session.count({
  where: {
    // ... the filter for the Sessions we want to count
  }
})
```

***

### create()

> **create**\<`T`\>(`args`): [`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:600

Create a Session.

#### Type Parameters

##### T

`T` *extends* [`SessionCreateArgs`](../type-aliases/SessionCreateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionCreateArgs`](../type-aliases/SessionCreateArgs.md)\<`ExtArgs`\>\>

Arguments to create a Session.

#### Returns

[`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Create one Session
const Session = await prisma.session.create({
  data: {
    // ... data to create a Session
  }
})
```

***

### createMany()

> **createMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:614

Create many Sessions.

#### Type Parameters

##### T

`T` *extends* [`SessionCreateManyArgs`](../type-aliases/SessionCreateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionCreateManyArgs`](../type-aliases/SessionCreateManyArgs.md)\<`ExtArgs`\>\>

Arguments to create many Sessions.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Create many Sessions
const session = await prisma.session.createMany({
  data: [
    // ... provide data here
  ]
})
```

***

### createManyAndReturn()

> **createManyAndReturn**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:638

Create many Sessions and returns the data saved in the database.

#### Type Parameters

##### T

`T` *extends* [`SessionCreateManyAndReturnArgs`](../type-aliases/SessionCreateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionCreateManyAndReturnArgs`](../type-aliases/SessionCreateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to create many Sessions.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Create many Sessions
const session = await prisma.session.createManyAndReturn({
  data: [
    // ... provide data here
  ]
})

// Create many Sessions and only return the `sessionToken`
const sessionWithSessionTokenOnly = await prisma.session.createManyAndReturn({
  select: { sessionToken: true },
  data: [
    // ... provide data here
  ]
})
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined
```

***

### delete()

> **delete**\<`T`\>(`args`): [`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:652

Delete a Session.

#### Type Parameters

##### T

`T` *extends* [`SessionDeleteArgs`](../type-aliases/SessionDeleteArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionDeleteArgs`](../type-aliases/SessionDeleteArgs.md)\<`ExtArgs`\>\>

Arguments to delete one Session.

#### Returns

[`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Delete one Session
const Session = await prisma.session.delete({
  where: {
    // ... filter to delete one Session
  }
})
```

***

### deleteMany()

> **deleteMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:683

Delete zero or more Sessions.

#### Type Parameters

##### T

`T` *extends* [`SessionDeleteManyArgs`](../type-aliases/SessionDeleteManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionDeleteManyArgs`](../type-aliases/SessionDeleteManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter Sessions to delete.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Delete a few Sessions
const { count } = await prisma.session.deleteMany({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirst()

> **findFirst**\<`T`\>(`args?`): [`Prisma__SessionClient`](Prisma__SessionClient.md)\<`null` \| `GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:552

Find the first Session that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`SessionFindFirstArgs`](../type-aliases/SessionFindFirstArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionFindFirstArgs`](../type-aliases/SessionFindFirstArgs.md)\<`ExtArgs`\>\>

Arguments to find a Session

#### Returns

[`Prisma__SessionClient`](Prisma__SessionClient.md)\<`null` \| `GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Session
const session = await prisma.session.findFirst({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirstOrThrow()

> **findFirstOrThrow**\<`T`\>(`args?`): [`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:568

Find the first Session that matches the filter or
throw `PrismaKnownClientError` with `P2025` code if no matches were found.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`SessionFindFirstOrThrowArgs`](../type-aliases/SessionFindFirstOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionFindFirstOrThrowArgs`](../type-aliases/SessionFindFirstOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a Session

#### Returns

[`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Session
const session = await prisma.session.findFirstOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### findMany()

> **findMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:586

Find zero or more Sessions that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`SessionFindManyArgs`](../type-aliases/SessionFindManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionFindManyArgs`](../type-aliases/SessionFindManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter and select certain fields only.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Get all Sessions
const sessions = await prisma.session.findMany()

// Get first 10 Sessions
const sessions = await prisma.session.findMany({ take: 10 })

// Only select the `sessionToken`
const sessionWithSessionTokenOnly = await prisma.session.findMany({ select: { sessionToken: true } })
```

***

### findUnique()

> **findUnique**\<`T`\>(`args`): [`Prisma__SessionClient`](Prisma__SessionClient.md)\<`null` \| `GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:523

Find zero or one Session that matches the filter.

#### Type Parameters

##### T

`T` *extends* [`SessionFindUniqueArgs`](../type-aliases/SessionFindUniqueArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionFindUniqueArgs`](../type-aliases/SessionFindUniqueArgs.md)\<`ExtArgs`\>\>

Arguments to find a Session

#### Returns

[`Prisma__SessionClient`](Prisma__SessionClient.md)\<`null` \| `GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Session
const session = await prisma.session.findUnique({
  where: {
    // ... provide filter here
  }
})
```

***

### findUniqueOrThrow()

> **findUniqueOrThrow**\<`T`\>(`args`): [`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:537

Find one Session that matches the filter or throw an error with `error.code='P2025'`
if no matches were found.

#### Type Parameters

##### T

`T` *extends* [`SessionFindUniqueOrThrowArgs`](../type-aliases/SessionFindUniqueOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionFindUniqueOrThrowArgs`](../type-aliases/SessionFindUniqueOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a Session

#### Returns

[`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Session
const session = await prisma.session.findUniqueOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### groupBy()

> **groupBy**\<`T`, `HasSelectOrTake`, `OrderByArg`, `OrderFields`, `ByFields`, `ByValid`, `HavingFields`, `HavingValid`, `ByEmpty`, `InputErrors`\>(`args`): `object` *extends* `InputErrors` ? `GetSessionGroupByPayload`\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:821

Group by Session.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`SessionGroupByArgs`](../type-aliases/SessionGroupByArgs.md)\<`DefaultArgs`\>

##### HasSelectOrTake

`HasSelectOrTake` *extends* `0` \| `1`

##### OrderByArg

`OrderByArg` *extends* \{ `orderBy`: `undefined` \| [`SessionOrderByWithAggregationInput`](../type-aliases/SessionOrderByWithAggregationInput.md) \| [`SessionOrderByWithAggregationInput`](../type-aliases/SessionOrderByWithAggregationInput.md)[]; \} \| \{ `orderBy?`: [`SessionOrderByWithAggregationInput`](../type-aliases/SessionOrderByWithAggregationInput.md) \| [`SessionOrderByWithAggregationInput`](../type-aliases/SessionOrderByWithAggregationInput.md)[]; \}

##### OrderFields

`OrderFields` *extends* `"createdAt"` \| `"updatedAt"` \| `"userId"` \| `"sessionToken"` \| `"expires"`

##### ByFields

`ByFields` *extends* [`SessionScalarFieldEnum`](../type-aliases/SessionScalarFieldEnum.md)

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

\{ \[key in string \| number \| symbol\]: key extends keyof SessionGroupByArgs\<DefaultArgs\> ? T\[key\<key\>\] : never \} & `OrderByArg` & `InputErrors`

Group by arguments.

#### Returns

`object` *extends* `InputErrors` ? `GetSessionGroupByPayload`\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

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

> **update**\<`T`\>(`args`): [`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:669

Update one Session.

#### Type Parameters

##### T

`T` *extends* [`SessionUpdateArgs`](../type-aliases/SessionUpdateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionUpdateArgs`](../type-aliases/SessionUpdateArgs.md)\<`ExtArgs`\>\>

Arguments to update one Session.

#### Returns

[`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update one Session
const session = await prisma.session.update({
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

Defined in: packages/prisma/generated/prisma/models/Session.ts:702

Update zero or more Sessions.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`SessionUpdateManyArgs`](../type-aliases/SessionUpdateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionUpdateManyArgs`](../type-aliases/SessionUpdateManyArgs.md)\<`ExtArgs`\>\>

Arguments to update one or more rows.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Update many Sessions
const session = await prisma.session.updateMany({
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

> **updateManyAndReturn**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:732

Update zero or more Sessions and returns the data updated in the database.

#### Type Parameters

##### T

`T` *extends* [`SessionUpdateManyAndReturnArgs`](../type-aliases/SessionUpdateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionUpdateManyAndReturnArgs`](../type-aliases/SessionUpdateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to update many Sessions.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Update many Sessions
const session = await prisma.session.updateManyAndReturn({
  where: {
    // ... provide filter here
  },
  data: [
    // ... provide data here
  ]
})

// Update zero or more Sessions and only return the `sessionToken`
const sessionWithSessionTokenOnly = await prisma.session.updateManyAndReturn({
  select: { sessionToken: true },
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

> **upsert**\<`T`\>(`args`): [`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:751

Create or update one Session.

#### Type Parameters

##### T

`T` *extends* [`SessionUpsertArgs`](../type-aliases/SessionUpsertArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`SessionUpsertArgs`](../type-aliases/SessionUpsertArgs.md)\<`ExtArgs`\>\>

Arguments to update or create a Session.

#### Returns

[`Prisma__SessionClient`](Prisma__SessionClient.md)\<`GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update or create a Session
const session = await prisma.session.upsert({
  create: {
    // ... data to create a Session
  },
  update: {
    // ... in case it already exists, update
  },
  where: {
    // ... the filter for the Session we want to update
  }
})
```
