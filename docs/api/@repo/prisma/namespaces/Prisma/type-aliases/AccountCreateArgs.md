[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountCreateArgs

# Type Alias: AccountCreateArgs\<ExtArgs\>

> **AccountCreateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1468

Account create

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`AccountCreateInput`](AccountCreateInput.md), [`AccountUncheckedCreateInput`](AccountUncheckedCreateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1484

The data needed to create a Account.

***

### include?

> `optional` **include**: [`AccountInclude`](AccountInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1480

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AccountOmit`](AccountOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1476

Omit specific fields from the Account

***

### select?

> `optional` **select**: [`AccountSelect`](AccountSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1472

Select specific fields to fetch from the Account
