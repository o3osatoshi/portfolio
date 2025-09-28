[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountAggregateArgs

# Type Alias: AccountAggregateArgs\<ExtArgs\>

> **AccountAggregateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Account.ts:143

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### \_avg?

> `optional` **\_avg**: [`AccountAvgAggregateInputType`](AccountAvgAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:183

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to average

***

### \_count?

> `optional` **\_count**: `true` \| [`AccountCountAggregateInputType`](AccountCountAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:177

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Count returned Accounts

***

### \_max?

> `optional` **\_max**: [`AccountMaxAggregateInputType`](AccountMaxAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:201

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the maximum value

***

### \_min?

> `optional` **\_min**: [`AccountMinAggregateInputType`](AccountMinAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:195

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the minimum value

***

### \_sum?

> `optional` **\_sum**: [`AccountSumAggregateInputType`](AccountSumAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:189

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to sum

***

### cursor?

> `optional` **cursor**: [`AccountWhereUniqueInput`](AccountWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:159

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the start position

***

### orderBy?

> `optional` **orderBy**: [`AccountOrderByWithRelationInput`](AccountOrderByWithRelationInput.md) \| [`AccountOrderByWithRelationInput`](AccountOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Account.ts:153

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Accounts to fetch.

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Account.ts:171

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Accounts.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Account.ts:165

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Accounts from the position of the cursor.

***

### where?

> `optional` **where**: [`AccountWhereInput`](AccountWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:147

Filter which Account to aggregate.
