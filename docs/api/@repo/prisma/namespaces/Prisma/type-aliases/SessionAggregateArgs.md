[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionAggregateArgs

# Type Alias: SessionAggregateArgs\<ExtArgs\>

> **SessionAggregateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:77

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### \_count?

> `optional` **\_count**: `true` \| [`SessionCountAggregateInputType`](SessionCountAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:111

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Count returned Sessions

***

### \_max?

> `optional` **\_max**: [`SessionMaxAggregateInputType`](SessionMaxAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:123

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the maximum value

***

### \_min?

> `optional` **\_min**: [`SessionMinAggregateInputType`](SessionMinAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:117

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the minimum value

***

### cursor?

> `optional` **cursor**: [`SessionWhereUniqueInput`](SessionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:93

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the start position

***

### orderBy?

> `optional` **orderBy**: [`SessionOrderByWithRelationInput`](SessionOrderByWithRelationInput.md) \| [`SessionOrderByWithRelationInput`](SessionOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:87

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Sessions to fetch.

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:105

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Sessions.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:99

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Sessions from the position of the cursor.

***

### where?

> `optional` **where**: [`SessionWhereInput`](SessionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:81

Filter which Session to aggregate.
