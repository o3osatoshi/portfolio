[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionAggregateArgs

# Type Alias: TransactionAggregateArgs\<ExtArgs\>

> **TransactionAggregateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:149

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### \_avg?

> `optional` **\_avg**: [`TransactionAvgAggregateInputType`](TransactionAvgAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:189

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to average

***

### \_count?

> `optional` **\_count**: `true` \| [`TransactionCountAggregateInputType`](TransactionCountAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:183

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Count returned Transactions

***

### \_max?

> `optional` **\_max**: [`TransactionMaxAggregateInputType`](TransactionMaxAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:207

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the maximum value

***

### \_min?

> `optional` **\_min**: [`TransactionMinAggregateInputType`](TransactionMinAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:201

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the minimum value

***

### \_sum?

> `optional` **\_sum**: [`TransactionSumAggregateInputType`](TransactionSumAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:195

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to sum

***

### cursor?

> `optional` **cursor**: [`TransactionWhereUniqueInput`](TransactionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:165

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the start position

***

### orderBy?

> `optional` **orderBy**: [`TransactionOrderByWithRelationInput`](TransactionOrderByWithRelationInput.md) \| [`TransactionOrderByWithRelationInput`](TransactionOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:159

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Transactions to fetch.

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:177

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Transactions.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:171

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Transactions from the position of the cursor.

***

### where?

> `optional` **where**: [`TransactionWhereInput`](TransactionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:153

Filter which Transaction to aggregate.
