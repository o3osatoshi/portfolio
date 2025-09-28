[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / VerificationTokenAggregateArgs

# Type Alias: VerificationTokenAggregateArgs\<ExtArgs\>

> **VerificationTokenAggregateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:65

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### \_count?

> `optional` **\_count**: `true` \| [`VerificationTokenCountAggregateInputType`](VerificationTokenCountAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:99

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Count returned VerificationTokens

***

### \_max?

> `optional` **\_max**: [`VerificationTokenMaxAggregateInputType`](VerificationTokenMaxAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:111

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the maximum value

***

### \_min?

> `optional` **\_min**: [`VerificationTokenMinAggregateInputType`](VerificationTokenMinAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:105

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the minimum value

***

### cursor?

> `optional` **cursor**: [`VerificationTokenWhereUniqueInput`](VerificationTokenWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:81

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the start position

***

### orderBy?

> `optional` **orderBy**: [`VerificationTokenOrderByWithRelationInput`](VerificationTokenOrderByWithRelationInput.md) \| [`VerificationTokenOrderByWithRelationInput`](VerificationTokenOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:75

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of VerificationTokens to fetch.

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:93

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` VerificationTokens.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:87

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` VerificationTokens from the position of the cursor.

***

### where?

> `optional` **where**: [`VerificationTokenWhereInput`](VerificationTokenWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:69

Filter which VerificationToken to aggregate.
