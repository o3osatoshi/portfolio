[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountFindManyArgs

# Type Alias: AccountFindManyArgs\<ExtArgs\>

> **AccountFindManyArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1421

Account findMany

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`AccountWhereUniqueInput`](AccountWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:1449

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for listing Accounts.

***

### distinct?

> `optional` **distinct**: [`AccountScalarFieldEnum`](AccountScalarFieldEnum.md) \| [`AccountScalarFieldEnum`](AccountScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Account.ts:1462

***

### include?

> `optional` **include**: [`AccountInclude`](AccountInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1433

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AccountOmit`](AccountOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1429

Omit specific fields from the Account

***

### orderBy?

> `optional` **orderBy**: [`AccountOrderByWithRelationInput`](AccountOrderByWithRelationInput.md) \| [`AccountOrderByWithRelationInput`](AccountOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Account.ts:1443

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Accounts to fetch.

***

### select?

> `optional` **select**: [`AccountSelect`](AccountSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1425

Select specific fields to fetch from the Account

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1461

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Accounts.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1455

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Accounts from the position of the cursor.

***

### where?

> `optional` **where**: [`AccountWhereInput`](AccountWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:1437

Filter, which Accounts to fetch.
