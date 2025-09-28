[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AccountFindFirstOrThrowArgs

# Type Alias: AccountFindFirstOrThrowArgs\<ExtArgs\>

> **AccountFindFirstOrThrowArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1369

Account findFirstOrThrow

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`AccountWhereUniqueInput`](AccountWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:1397

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for searching for Accounts.

***

### distinct?

> `optional` **distinct**: [`AccountScalarFieldEnum`](AccountScalarFieldEnum.md) \| [`AccountScalarFieldEnum`](AccountScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Account.ts:1415

[Distinct Docs](https://www.prisma.io/docs/concepts/components/prisma-client/distinct)

Filter by unique combinations of Accounts.

***

### include?

> `optional` **include**: [`AccountInclude`](AccountInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1381

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AccountOmit`](AccountOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1377

Omit specific fields from the Account

***

### orderBy?

> `optional` **orderBy**: [`AccountOrderByWithRelationInput`](AccountOrderByWithRelationInput.md) \| [`AccountOrderByWithRelationInput`](AccountOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Account.ts:1391

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Accounts to fetch.

***

### select?

> `optional` **select**: [`AccountSelect`](AccountSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1373

Select specific fields to fetch from the Account

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1409

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Accounts.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Account.ts:1403

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Accounts from the position of the cursor.

***

### where?

> `optional` **where**: [`AccountWhereInput`](AccountWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Account.ts:1385

Filter, which Account to fetch.
