[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TransactionFindFirstArgs

# Type Alias: TransactionFindFirstArgs\<ExtArgs\>

> **TransactionFindFirstArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1314

Transaction findFirst

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`TransactionWhereUniqueInput`](TransactionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1342

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for searching for Transactions.

***

### distinct?

> `optional` **distinct**: [`TransactionScalarFieldEnum`](TransactionScalarFieldEnum.md) \| [`TransactionScalarFieldEnum`](TransactionScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1360

[Distinct Docs](https://www.prisma.io/docs/concepts/components/prisma-client/distinct)

Filter by unique combinations of Transactions.

***

### include?

> `optional` **include**: [`TransactionInclude`](TransactionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1326

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`TransactionOmit`](TransactionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1322

Omit specific fields from the Transaction

***

### orderBy?

> `optional` **orderBy**: [`TransactionOrderByWithRelationInput`](TransactionOrderByWithRelationInput.md) \| [`TransactionOrderByWithRelationInput`](TransactionOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1336

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Transactions to fetch.

***

### select?

> `optional` **select**: [`TransactionSelect`](TransactionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1318

Select specific fields to fetch from the Transaction

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1354

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Transactions.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1348

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Transactions from the position of the cursor.

***

### where?

> `optional` **where**: [`TransactionWhereInput`](TransactionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:1330

Filter, which Transaction to fetch.
