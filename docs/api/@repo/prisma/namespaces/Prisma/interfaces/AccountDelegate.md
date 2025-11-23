[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountDelegate

# Interface: AccountDelegate\<ExtArgs, GlobalOmitOptions\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:840

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

### GlobalOmitOptions

`GlobalOmitOptions` = \{ \}

## Indexable

\[`K`: `symbol`\]: `object`

## Properties

### fields

> `readonly` **fields**: [`AccountFieldRefs`](AccountFieldRefs.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:1212

Fields of the Account model

## Methods

### aggregate()

> **aggregate**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetAccountAggregateType`](../type-aliases/GetAccountAggregateType.md)\<`T`\>\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1131

Allows you to perform aggregations operations on a Account.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AccountAggregateArgs`](../type-aliases/AccountAggregateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`Subset`](../type-aliases/Subset.md)\<`T`, [`AccountAggregateArgs`](../type-aliases/AccountAggregateArgs.md)\>

Select which aggregations you would like to apply and on what fields.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`GetAccountAggregateType`](../type-aliases/GetAccountAggregateType.md)\<`T`\>\>

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

> **count**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof AccountCountAggregateOutputType ? AccountCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1097

Count the number of Accounts.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AccountCountArgs`](../type-aliases/AccountCountArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`Subset`](../type-aliases/Subset.md)\<`T`, [`AccountCountArgs`](../type-aliases/AccountCountArgs.md)\<`DefaultArgs`\>\>

Arguments to filter Accounts to count.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T` *extends* `Record_2`\<`"select"`, `any`\> ? `T`\<`T`\>\[`"select"`\] *extends* `true` ? `number` : \{ \[P in string \| number \| symbol\]: P extends keyof AccountCountAggregateOutputType ? AccountCountAggregateOutputType\[P\<P\>\] : never \} : `number`\>

#### Example

```ts
// Count the number of Accounts
const count = await prisma.account.count({
  where: {
    // ... the filter for the Accounts we want to count
  }
})
```

***

### create()

> **create**\<`T`\>(`args`): [`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:930

Create a Account.

#### Type Parameters

##### T

`T` *extends* [`AccountCreateArgs`](../type-aliases/AccountCreateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountCreateArgs`](../type-aliases/AccountCreateArgs.md)\<`ExtArgs`\>\>

Arguments to create a Account.

#### Returns

[`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Create one Account
const Account = await prisma.account.create({
  data: {
    // ... data to create a Account
  }
})
```

***

### createMany()

> **createMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:944

Create many Accounts.

#### Type Parameters

##### T

`T` *extends* [`AccountCreateManyArgs`](../type-aliases/AccountCreateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountCreateManyArgs`](../type-aliases/AccountCreateManyArgs.md)\<`ExtArgs`\>\>

Arguments to create many Accounts.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Create many Accounts
const account = await prisma.account.createMany({
  data: [
    // ... provide data here
  ]
})
```

***

### createManyAndReturn()

> **createManyAndReturn**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:968

Create many Accounts and returns the data saved in the database.

#### Type Parameters

##### T

`T` *extends* [`AccountCreateManyAndReturnArgs`](../type-aliases/AccountCreateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountCreateManyAndReturnArgs`](../type-aliases/AccountCreateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to create many Accounts.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Create many Accounts
const account = await prisma.account.createManyAndReturn({
  data: [
    // ... provide data here
  ]
})

// Create many Accounts and only return the `userId`
const accountWithUserIdOnly = await prisma.account.createManyAndReturn({
  select: { userId: true },
  data: [
    // ... provide data here
  ]
})
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined
```

***

### delete()

> **delete**\<`T`\>(`args`): [`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:982

Delete a Account.

#### Type Parameters

##### T

`T` *extends* [`AccountDeleteArgs`](../type-aliases/AccountDeleteArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountDeleteArgs`](../type-aliases/AccountDeleteArgs.md)\<`ExtArgs`\>\>

Arguments to delete one Account.

#### Returns

[`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Delete one Account
const Account = await prisma.account.delete({
  where: {
    // ... filter to delete one Account
  }
})
```

***

### deleteMany()

> **deleteMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1013

Delete zero or more Accounts.

#### Type Parameters

##### T

`T` *extends* [`AccountDeleteManyArgs`](../type-aliases/AccountDeleteManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountDeleteManyArgs`](../type-aliases/AccountDeleteManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter Accounts to delete.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Delete a few Accounts
const { count } = await prisma.account.deleteMany({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirst()

> **findFirst**\<`T`\>(`args?`): [`Prisma__AccountClient`](Prisma__AccountClient.md)\<`null` \| `GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:882

Find the first Account that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AccountFindFirstArgs`](../type-aliases/AccountFindFirstArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountFindFirstArgs`](../type-aliases/AccountFindFirstArgs.md)\<`ExtArgs`\>\>

Arguments to find a Account

#### Returns

[`Prisma__AccountClient`](Prisma__AccountClient.md)\<`null` \| `GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Account
const account = await prisma.account.findFirst({
  where: {
    // ... provide filter here
  }
})
```

***

### findFirstOrThrow()

> **findFirstOrThrow**\<`T`\>(`args?`): [`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:898

Find the first Account that matches the filter or
throw `PrismaKnownClientError` with `P2025` code if no matches were found.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AccountFindFirstOrThrowArgs`](../type-aliases/AccountFindFirstOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountFindFirstOrThrowArgs`](../type-aliases/AccountFindFirstOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a Account

#### Returns

[`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Account
const account = await prisma.account.findFirstOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### findMany()

> **findMany**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:916

Find zero or more Accounts that matches the filter.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AccountFindManyArgs`](../type-aliases/AccountFindManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args?

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountFindManyArgs`](../type-aliases/AccountFindManyArgs.md)\<`ExtArgs`\>\>

Arguments to filter and select certain fields only.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Get all Accounts
const accounts = await prisma.account.findMany()

// Get first 10 Accounts
const accounts = await prisma.account.findMany({ take: 10 })

// Only select the `userId`
const accountWithUserIdOnly = await prisma.account.findMany({ select: { userId: true } })
```

***

### findUnique()

> **findUnique**\<`T`\>(`args`): [`Prisma__AccountClient`](Prisma__AccountClient.md)\<`null` \| `GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:853

Find zero or one Account that matches the filter.

#### Type Parameters

##### T

`T` *extends* [`AccountFindUniqueArgs`](../type-aliases/AccountFindUniqueArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountFindUniqueArgs`](../type-aliases/AccountFindUniqueArgs.md)\<`ExtArgs`\>\>

Arguments to find a Account

#### Returns

[`Prisma__AccountClient`](Prisma__AccountClient.md)\<`null` \| `GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `null`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Account
const account = await prisma.account.findUnique({
  where: {
    // ... provide filter here
  }
})
```

***

### findUniqueOrThrow()

> **findUniqueOrThrow**\<`T`\>(`args`): [`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:867

Find one Account that matches the filter or throw an error with `error.code='P2025'`
if no matches were found.

#### Type Parameters

##### T

`T` *extends* [`AccountFindUniqueOrThrowArgs`](../type-aliases/AccountFindUniqueOrThrowArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountFindUniqueOrThrowArgs`](../type-aliases/AccountFindUniqueOrThrowArgs.md)\<`ExtArgs`\>\>

Arguments to find a Account

#### Returns

[`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Get one Account
const account = await prisma.account.findUniqueOrThrow({
  where: {
    // ... provide filter here
  }
})
```

***

### groupBy()

> **groupBy**\<`T`, `HasSelectOrTake`, `OrderByArg`, `OrderFields`, `ByFields`, `ByValid`, `HavingFields`, `HavingValid`, `ByEmpty`, `InputErrors`\>(`args`): `object` *extends* `InputErrors` ? [`GetAccountGroupByPayload`](../type-aliases/GetAccountGroupByPayload.md)\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1151

Group by Account.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AccountGroupByArgs`](../type-aliases/AccountGroupByArgs.md)\<`DefaultArgs`\>

##### HasSelectOrTake

`HasSelectOrTake` *extends* `0` \| `1`

##### OrderByArg

`OrderByArg` *extends* \{ `orderBy`: `undefined` \| [`AccountOrderByWithAggregationInput`](../type-aliases/AccountOrderByWithAggregationInput.md) \| [`AccountOrderByWithAggregationInput`](../type-aliases/AccountOrderByWithAggregationInput.md)[]; \} \| \{ `orderBy?`: [`AccountOrderByWithAggregationInput`](../type-aliases/AccountOrderByWithAggregationInput.md) \| [`AccountOrderByWithAggregationInput`](../type-aliases/AccountOrderByWithAggregationInput.md)[]; \}

##### OrderFields

`OrderFields` *extends* `"type"` \| `"createdAt"` \| `"updatedAt"` \| `"userId"` \| `"provider"` \| `"providerAccountId"` \| `"refresh_token"` \| `"access_token"` \| `"expires_at"` \| `"token_type"` \| `"scope"` \| `"id_token"` \| `"session_state"`

##### ByFields

`ByFields` *extends* [`AccountScalarFieldEnum`](../type-aliases/AccountScalarFieldEnum.md)

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

\{ \[key in string \| number \| symbol\]: key extends keyof AccountGroupByArgs\<DefaultArgs\> ? T\[key\<key\>\] : never \} & `OrderByArg` & `InputErrors`

Group by arguments.

#### Returns

`object` *extends* `InputErrors` ? [`GetAccountGroupByPayload`](../type-aliases/GetAccountGroupByPayload.md)\<`T`\> : [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`InputErrors`\>

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

> **update**\<`T`\>(`args`): [`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:999

Update one Account.

#### Type Parameters

##### T

`T` *extends* [`AccountUpdateArgs`](../type-aliases/AccountUpdateArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountUpdateArgs`](../type-aliases/AccountUpdateArgs.md)\<`ExtArgs`\>\>

Arguments to update one Account.

#### Returns

[`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update one Account
const account = await prisma.account.update({
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

Defined in: packages/prisma/generated/prisma/models/Account.ts:1032

Update zero or more Accounts.
Note, that providing `undefined` is treated as the value not being there.
Read more here: https://pris.ly/d/null-undefined

#### Type Parameters

##### T

`T` *extends* [`AccountUpdateManyArgs`](../type-aliases/AccountUpdateManyArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountUpdateManyArgs`](../type-aliases/AccountUpdateManyArgs.md)\<`ExtArgs`\>\>

Arguments to update one or more rows.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<[`BatchPayload`](../type-aliases/BatchPayload.md)\>

#### Example

```ts
// Update many Accounts
const account = await prisma.account.updateMany({
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

> **updateManyAndReturn**\<`T`\>(`args`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1062

Update zero or more Accounts and returns the data updated in the database.

#### Type Parameters

##### T

`T` *extends* [`AccountUpdateManyAndReturnArgs`](../type-aliases/AccountUpdateManyAndReturnArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountUpdateManyAndReturnArgs`](../type-aliases/AccountUpdateManyAndReturnArgs.md)\<`ExtArgs`\>\>

Arguments to update many Accounts.

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

#### Example

```ts
// Update many Accounts
const account = await prisma.account.updateManyAndReturn({
  where: {
    // ... provide filter here
  },
  data: [
    // ... provide data here
  ]
})

// Update zero or more Accounts and only return the `userId`
const accountWithUserIdOnly = await prisma.account.updateManyAndReturn({
  select: { userId: true },
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

> **upsert**\<`T`\>(`args`): [`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1081

Create or update one Account.

#### Type Parameters

##### T

`T` *extends* [`AccountUpsertArgs`](../type-aliases/AccountUpsertArgs.md)\<`DefaultArgs`\>

#### Parameters

##### args

[`SelectSubset`](../type-aliases/SelectSubset.md)\<`T`, [`AccountUpsertArgs`](../type-aliases/AccountUpsertArgs.md)\<`ExtArgs`\>\>

Arguments to update or create a Account.

#### Returns

[`Prisma__AccountClient`](Prisma__AccountClient.md)\<`GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>, `never`, `ExtArgs`, `GlobalOmitOptions`\>

#### Example

```ts
// Update or create a Account
const account = await prisma.account.upsert({
  create: {
    // ... data to create a Account
  },
  update: {
    // ... in case it already exists, update
  },
  where: {
    // ... the filter for the Account we want to update
  }
})
```
