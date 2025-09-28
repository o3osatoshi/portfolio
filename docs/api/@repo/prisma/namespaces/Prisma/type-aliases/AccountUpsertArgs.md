[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountUpsertArgs

# Type Alias: AccountUpsertArgs\<ExtArgs\>

> **AccountUpsertArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1598

Account upsert

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### create

> **create**: [`XOR`](XOR.md)\<[`AccountCreateInput`](AccountCreateInput.md), [`AccountUncheckedCreateInput`](AccountUncheckedCreateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1618

In case the Account found by the `where` argument doesn't exist, create a new Account with this data.

***

### include?

> `optional` **include**: [`AccountInclude`](AccountInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1610

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AccountOmit`](AccountOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1606

Omit specific fields from the Account

***

### select?

> `optional` **select**: [`AccountSelect`](AccountSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1602

Select specific fields to fetch from the Account

***

### update

> **update**: [`XOR`](XOR.md)\<[`AccountUpdateInput`](AccountUpdateInput.md), [`AccountUncheckedUpdateInput`](AccountUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1622

In case the Account was found with the provided `where` argument, update it with this data.

***

### where

> **where**: [`AccountWhereUniqueInput`](AccountWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:1614

The filter to search for the Account to update in case it exists.
