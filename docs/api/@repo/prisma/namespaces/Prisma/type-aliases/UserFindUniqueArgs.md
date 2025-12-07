[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / UserFindUniqueArgs

# Type Alias: UserFindUniqueArgs\<ExtArgs\>

> **UserFindUniqueArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/User.ts:1288

User findUnique

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### include?

> `optional` **include**: [`UserInclude`](UserInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1300

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`UserOmit`](UserOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1296

Omit specific fields from the User

***

### select?

> `optional` **select**: [`UserSelect`](UserSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1292

Select specific fields to fetch from the User

***

### where

> **where**: [`UserWhereUniqueInput`](UserWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/User.ts:1304

Filter, which User to fetch.
