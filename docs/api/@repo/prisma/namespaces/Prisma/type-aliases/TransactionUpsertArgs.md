[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionUpsertArgs

# Type Alias: TransactionUpsertArgs\<ExtArgs\>

> **TransactionUpsertArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1596

Transaction upsert

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### create

> **create**: [`XOR`](XOR.md)\<[`TransactionCreateInput`](TransactionCreateInput.md), [`TransactionUncheckedCreateInput`](TransactionUncheckedCreateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1616

In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.

***

### include?

> `optional` **include**: [`TransactionInclude`](TransactionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1608

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`TransactionOmit`](TransactionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1604

Omit specific fields from the Transaction

***

### select?

> `optional` **select**: [`TransactionSelect`](TransactionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1600

Select specific fields to fetch from the Transaction

***

### update

> **update**: [`XOR`](XOR.md)\<[`TransactionUpdateInput`](TransactionUpdateInput.md), [`TransactionUncheckedUpdateInput`](TransactionUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1620

In case the Transaction was found with the provided `where` argument, update it with this data.

***

### where

> **where**: [`TransactionWhereUniqueInput`](TransactionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1612

The filter to search for the Transaction to update in case it exists.
