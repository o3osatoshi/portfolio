[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / UserFindUniqueOrThrowArgs

# Type Alias: UserFindUniqueOrThrowArgs\<ExtArgs\>

> **UserFindUniqueOrThrowArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/User.ts:1309

User findUniqueOrThrow

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### include?

> `optional` **include**: [`UserInclude`](UserInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1321

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`UserOmit`](UserOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1317

Omit specific fields from the User

***

### select?

> `optional` **select**: [`UserSelect`](UserSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1313

Select specific fields to fetch from the User

***

### where

> **where**: [`UserWhereUniqueInput`](UserWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/User.ts:1325

Filter, which User to fetch.
