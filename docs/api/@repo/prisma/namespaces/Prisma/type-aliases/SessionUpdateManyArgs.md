[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionUpdateManyArgs

# Type Alias: SessionUpdateManyArgs\<ExtArgs\>

> **SessionUpdateManyArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1212

Session updateMany

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`SessionUpdateManyMutationInput`](SessionUpdateManyMutationInput.md), [`SessionUncheckedUpdateManyInput`](SessionUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:1216

The data used to update Sessions.

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1224

Limit how many Sessions to update.

***

### where?

> `optional` **where**: [`SessionWhereInput`](SessionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:1220

Filter which Sessions to update
