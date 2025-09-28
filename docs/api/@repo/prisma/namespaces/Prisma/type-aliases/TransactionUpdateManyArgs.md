[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionUpdateManyArgs

# Type Alias: TransactionUpdateManyArgs\<ExtArgs\>

> **TransactionUpdateManyArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1547

Transaction updateMany

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`TransactionUpdateManyMutationInput`](TransactionUpdateManyMutationInput.md), [`TransactionUncheckedUpdateManyInput`](TransactionUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1551

The data used to update Transactions.

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1559

Limit how many Transactions to update.

***

### where?

> `optional` **where**: [`TransactionWhereInput`](TransactionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1555

Filter which Transactions to update
