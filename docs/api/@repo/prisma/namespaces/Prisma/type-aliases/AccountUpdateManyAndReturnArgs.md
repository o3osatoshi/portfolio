[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountUpdateManyAndReturnArgs

# Type Alias: AccountUpdateManyAndReturnArgs\<ExtArgs\>

> **AccountUpdateManyAndReturnArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1569

Account updateManyAndReturn

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`AccountUpdateManyMutationInput`](AccountUpdateManyMutationInput.md), [`AccountUncheckedUpdateManyInput`](AccountUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1581

The data used to update Accounts.

***

### include?

> `optional` **include**: [`AccountIncludeUpdateManyAndReturn`](AccountIncludeUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1593

Choose, which related nodes to fetch as well

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1589

Limit how many Accounts to update.

***

### omit?

> `optional` **omit**: [`AccountOmit`](AccountOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1577

Omit specific fields from the Account

***

### select?

> `optional` **select**: [`AccountSelectUpdateManyAndReturn`](AccountSelectUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1573

Select specific fields to fetch from the Account

***

### where?

> `optional` **where**: [`AccountWhereInput`](AccountWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:1585

Filter which Accounts to update
