[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionFindUniqueArgs

# Type Alias: TransactionFindUniqueArgs\<ExtArgs\>

> **TransactionFindUniqueArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1271

Transaction findUnique

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### include?

> `optional` **include**: [`TransactionInclude`](TransactionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1283

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`TransactionOmit`](TransactionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1279

Omit specific fields from the Transaction

***

### select?

> `optional` **select**: [`TransactionSelect`](TransactionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1275

Select specific fields to fetch from the Transaction

***

### where

> **where**: [`TransactionWhereUniqueInput`](TransactionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1287

Filter, which Transaction to fetch.
