[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / UserUpdateManyArgs

# Type Alias: UserUpdateManyArgs\<ExtArgs\>

> **UserUpdateManyArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/User.ts:1560

User updateMany

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`UserUpdateManyMutationInput`](UserUpdateManyMutationInput.md), [`UserUncheckedUpdateManyInput`](UserUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1564

The data used to update Users.

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/User.ts:1572

Limit how many Users to update.

***

### where?

> `optional` **where**: [`UserWhereInput`](UserWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/User.ts:1568

Filter which Users to update
