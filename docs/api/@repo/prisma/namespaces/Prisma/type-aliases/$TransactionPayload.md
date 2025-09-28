[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / $TransactionPayload

# Type Alias: $TransactionPayload\<ExtArgs\>

> **$TransactionPayload**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:809

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### composites

> **composites**: `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:828

***

### name

> **name**: `"Transaction"`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:810

***

### objects

> **objects**: `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:811

#### user

> **user**: [`$UserPayload`]($UserPayload.md)\<`ExtArgs`\>

***

### scalars

> **scalars**: `runtime.Types.Extensions.GetPayloadResult`\<\{ `amount`: `runtime.Decimal`; `createdAt`: `Date`; `currency`: `string`; `datetime`: `Date`; `fee`: `runtime.Decimal` \| `null`; `feeCurrency`: `string` \| `null`; `id`: `string`; `price`: `runtime.Decimal`; `profitLoss`: `runtime.Decimal` \| `null`; `type`: `string`; `updatedAt`: `Date`; `userId`: `string`; \}, `ExtArgs`\[`"result"`\]\[`"transaction"`\]\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:814
