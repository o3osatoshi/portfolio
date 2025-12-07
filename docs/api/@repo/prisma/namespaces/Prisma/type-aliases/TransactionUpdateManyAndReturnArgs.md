[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionUpdateManyAndReturnArgs

# Type Alias: TransactionUpdateManyAndReturnArgs\<ExtArgs\>

> **TransactionUpdateManyAndReturnArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1566

Transaction updateManyAndReturn

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`TransactionUpdateManyMutationInput`](TransactionUpdateManyMutationInput.md), [`TransactionUncheckedUpdateManyInput`](TransactionUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1578

The data used to update Transactions.

***

### include?

> `optional` **include**: [`TransactionIncludeUpdateManyAndReturn`](TransactionIncludeUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1590

Choose, which related nodes to fetch as well

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1586

Limit how many Transactions to update.

***

### omit?

> `optional` **omit**: [`TransactionOmit`](TransactionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1574

Omit specific fields from the Transaction

***

### select?

> `optional` **select**: [`TransactionSelectUpdateManyAndReturn`](TransactionSelectUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1570

Select specific fields to fetch from the Transaction

***

### where?

> `optional` **where**: [`TransactionWhereInput`](TransactionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1582

Filter which Transactions to update
