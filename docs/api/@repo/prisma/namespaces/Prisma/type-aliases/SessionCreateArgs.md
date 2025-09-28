[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionCreateArgs

# Type Alias: SessionCreateArgs\<ExtArgs\>

> **SessionCreateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1130

Session create

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`SessionCreateInput`](SessionCreateInput.md), [`SessionUncheckedCreateInput`](SessionUncheckedCreateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Session.ts:1146

The data needed to create a Session.

***

### include?

> `optional` **include**: [`SessionInclude`](SessionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1142

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`SessionOmit`](SessionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1138

Omit specific fields from the Session

***

### select?

> `optional` **select**: [`SessionSelect`](SessionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1134

Select specific fields to fetch from the Session
