[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionFindManyArgs

# Type Alias: TransactionFindManyArgs\<ExtArgs\>

> **TransactionFindManyArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1419

Transaction findMany

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`TransactionWhereUniqueInput`](TransactionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1447

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for listing Transactions.

***

### distinct?

> `optional` **distinct**: [`TransactionScalarFieldEnum`](TransactionScalarFieldEnum.md) \| [`TransactionScalarFieldEnum`](TransactionScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1460

***

### include?

> `optional` **include**: [`TransactionInclude`](TransactionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1431

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`TransactionOmit`](TransactionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1427

Omit specific fields from the Transaction

***

### orderBy?

> `optional` **orderBy**: [`TransactionOrderByWithRelationInput`](TransactionOrderByWithRelationInput.md) \| [`TransactionOrderByWithRelationInput`](TransactionOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1441

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Transactions to fetch.

***

### select?

> `optional` **select**: [`TransactionSelect`](TransactionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1423

Select specific fields to fetch from the Transaction

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1459

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Transactions.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1453

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Transactions from the position of the cursor.

***

### where?

> `optional` **where**: [`TransactionWhereInput`](TransactionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1435

Filter, which Transactions to fetch.
