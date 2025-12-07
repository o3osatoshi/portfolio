[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionUpdateArgs

# Type Alias: TransactionUpdateArgs\<ExtArgs\>

> **TransactionUpdateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1522

Transaction update

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`TransactionUpdateInput`](TransactionUpdateInput.md), [`TransactionUncheckedUpdateInput`](TransactionUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1538

The data needed to update a Transaction.

***

### include?

> `optional` **include**: [`TransactionInclude`](TransactionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1534

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`TransactionOmit`](TransactionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1530

Omit specific fields from the Transaction

***

### select?

> `optional` **select**: [`TransactionSelect`](TransactionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1526

Select specific fields to fetch from the Transaction

***

### where

> **where**: [`TransactionWhereUniqueInput`](TransactionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1542

Choose, which Transaction to update.
