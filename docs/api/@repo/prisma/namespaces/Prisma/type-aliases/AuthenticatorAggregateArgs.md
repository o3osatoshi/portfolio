[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorAggregateArgs

# Type Alias: AuthenticatorAggregateArgs\<ExtArgs\>

> **AuthenticatorAggregateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:113

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### \_avg?

> `optional` **\_avg**: [`AuthenticatorAvgAggregateInputType`](AuthenticatorAvgAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:153

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to average

***

### \_count?

> `optional` **\_count**: `true` \| [`AuthenticatorCountAggregateInputType`](AuthenticatorCountAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:147

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Count returned Authenticators

***

### \_max?

> `optional` **\_max**: [`AuthenticatorMaxAggregateInputType`](AuthenticatorMaxAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:171

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the maximum value

***

### \_min?

> `optional` **\_min**: [`AuthenticatorMinAggregateInputType`](AuthenticatorMinAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:165

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to find the minimum value

***

### \_sum?

> `optional` **\_sum**: [`AuthenticatorSumAggregateInputType`](AuthenticatorSumAggregateInputType.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:159

[Aggregation Docs](https://www.prisma.io/docs/concepts/components/prisma-client/aggregations)

Select which fields to sum

***

### cursor?

> `optional` **cursor**: [`AuthenticatorWhereUniqueInput`](AuthenticatorWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:129

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the start position

***

### orderBy?

> `optional` **orderBy**: [`AuthenticatorOrderByWithRelationInput`](AuthenticatorOrderByWithRelationInput.md) \| [`AuthenticatorOrderByWithRelationInput`](AuthenticatorOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:123

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Authenticators to fetch.

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:141

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Authenticators.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:135

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Authenticators from the position of the cursor.

***

### where?

> `optional` **where**: [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:117

Filter which Authenticator to aggregate.
