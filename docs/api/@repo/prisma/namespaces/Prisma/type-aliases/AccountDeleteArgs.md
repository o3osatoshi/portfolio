[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountDeleteArgs

# Type Alias: AccountDeleteArgs\<ExtArgs\>

> **AccountDeleteArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1629

Account delete

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### include?

> `optional` **include**: [`AccountInclude`](AccountInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1641

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AccountOmit`](AccountOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1637

Omit specific fields from the Account

***

### select?

> `optional` **select**: [`AccountSelect`](AccountSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1633

Select specific fields to fetch from the Account

***

### where

> **where**: [`AccountWhereUniqueInput`](AccountWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:1645

Filter which Account to delete.
