[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / UserUpdateManyAndReturnArgs

# Type Alias: UserUpdateManyAndReturnArgs\<ExtArgs\>

> **UserUpdateManyAndReturnArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/User.ts:1578

User updateManyAndReturn

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`UserUpdateManyMutationInput`](UserUpdateManyMutationInput.md), [`UserUncheckedUpdateManyInput`](UserUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1590

The data used to update Users.

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/User.ts:1598

Limit how many Users to update.

***

### omit?

> `optional` **omit**: [`UserOmit`](UserOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1586

Omit specific fields from the User

***

### select?

> `optional` **select**: [`UserSelectUpdateManyAndReturn`](UserSelectUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/User.ts:1582

Select specific fields to fetch from the User

***

### where?

> `optional` **where**: [`UserWhereInput`](UserWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/User.ts:1594

Filter which Users to update
