[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionUpdateArgs

# Type Alias: SessionUpdateArgs\<ExtArgs\>

> **SessionUpdateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1186

Session update

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`SessionUpdateInput`](SessionUpdateInput.md), [`SessionUncheckedUpdateInput`](SessionUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:1202

The data needed to update a Session.

***

### include?

> `optional` **include**: [`SessionInclude`](SessionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1198

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`SessionOmit`](SessionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1194

Omit specific fields from the Session

***

### select?

> `optional` **select**: [`SessionSelect`](SessionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1190

Select specific fields to fetch from the Session

***

### where

> **where**: [`SessionWhereUniqueInput`](SessionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:1206

Choose, which Session to update.
