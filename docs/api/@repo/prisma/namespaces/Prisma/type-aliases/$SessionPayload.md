[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / $SessionPayload

# Type Alias: $SessionPayload\<ExtArgs\>

> **$SessionPayload**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:489

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### composites

> **composites**: `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:501

***

### name

> **name**: `"Session"`

Defined in: packages/prisma/generated/prisma/models/Session.ts:490

***

### objects

> **objects**: `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:491

#### user

> **user**: [`$UserPayload`]($UserPayload.md)\<`ExtArgs`\>

***

### scalars

> **scalars**: `runtime.Types.Extensions.GetPayloadResult`\<\{ `createdAt`: `Date`; `expires`: `Date`; `sessionToken`: `string`; `updatedAt`: `Date`; `userId`: `string`; \}, `ExtArgs`\[`"result"`\]\[`"session"`\]\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:494
