[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionUpsertArgs

# Type Alias: SessionUpsertArgs\<ExtArgs\>

> **SessionUpsertArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1261

Session upsert

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### create

> **create**: [`XOR`](XOR.md)\<[`SessionCreateInput`](SessionCreateInput.md), [`SessionUncheckedCreateInput`](SessionUncheckedCreateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:1281

In case the Session found by the `where` argument doesn't exist, create a new Session with this data.

***

### include?

> `optional` **include**: [`SessionInclude`](SessionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1273

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`SessionOmit`](SessionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1269

Omit specific fields from the Session

***

### select?

> `optional` **select**: [`SessionSelect`](SessionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1265

Select specific fields to fetch from the Session

***

### update

> **update**: [`XOR`](XOR.md)\<[`SessionUpdateInput`](SessionUpdateInput.md), [`SessionUncheckedUpdateInput`](SessionUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:1285

In case the Session was found with the provided `where` argument, update it with this data.

***

### where

> **where**: [`SessionWhereUniqueInput`](SessionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:1277

The filter to search for the Session to update in case it exists.
