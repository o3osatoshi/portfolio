[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / UserUpsertArgs

# Type Alias: UserUpsertArgs\<ExtArgs\>

> **UserUpsertArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/User.ts:1605

User upsert

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### create

> **create**: [`XOR`](XOR.md)\<[`UserCreateInput`](UserCreateInput.md), [`UserUncheckedCreateInput`](UserUncheckedCreateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1625

In case the User found by the `where` argument doesn't exist, create a new User with this data.

***

### include?

> `optional` **include**: [`UserInclude`](UserInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1617

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`UserOmit`](UserOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1613

Omit specific fields from the User

***

### select?

> `optional` **select**: [`UserSelect`](UserSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1609

Select specific fields to fetch from the User

***

### update

> **update**: [`XOR`](XOR.md)\<[`UserUpdateInput`](UserUpdateInput.md), [`UserUncheckedUpdateInput`](UserUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1629

In case the User was found with the provided `where` argument, update it with this data.

***

### where

> **where**: [`UserWhereUniqueInput`](UserWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/User.ts:1621

The filter to search for the User to update in case it exists.
