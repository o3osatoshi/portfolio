[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountUpdateManyArgs

# Type Alias: AccountUpdateManyArgs\<ExtArgs\>

> **AccountUpdateManyArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1550

Account updateMany

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`AccountUpdateManyMutationInput`](AccountUpdateManyMutationInput.md), [`AccountUncheckedUpdateManyInput`](AccountUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Account.ts:1554

The data used to update Accounts.

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1562

Limit how many Accounts to update.

***

### where?

> `optional` **where**: [`AccountWhereInput`](AccountWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:1558

Filter which Accounts to update
