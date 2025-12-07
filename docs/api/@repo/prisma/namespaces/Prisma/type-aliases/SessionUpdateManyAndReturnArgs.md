[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionUpdateManyAndReturnArgs

# Type Alias: SessionUpdateManyAndReturnArgs\<ExtArgs\>

> **SessionUpdateManyAndReturnArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1231

Session updateManyAndReturn

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`SessionUpdateManyMutationInput`](SessionUpdateManyMutationInput.md), [`SessionUncheckedUpdateManyInput`](SessionUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:1243

The data used to update Sessions.

***

### include?

> `optional` **include**: [`SessionIncludeUpdateManyAndReturn`](SessionIncludeUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1255

Choose, which related nodes to fetch as well

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1251

Limit how many Sessions to update.

***

### omit?

> `optional` **omit**: [`SessionOmit`](SessionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1239

Omit specific fields from the Session

***

### select?

> `optional` **select**: [`SessionSelectUpdateManyAndReturn`](SessionSelectUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1235

Select specific fields to fetch from the Session

***

### where?

> `optional` **where**: [`SessionWhereInput`](SessionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:1247

Filter which Sessions to update
