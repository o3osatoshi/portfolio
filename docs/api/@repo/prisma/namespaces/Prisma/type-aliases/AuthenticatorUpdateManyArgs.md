[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorUpdateManyArgs

# Type Alias: AuthenticatorUpdateManyArgs\<ExtArgs\>

> **AuthenticatorUpdateManyArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1379

Authenticator updateMany

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`AuthenticatorUpdateManyMutationInput`](AuthenticatorUpdateManyMutationInput.md), [`AuthenticatorUncheckedUpdateManyInput`](AuthenticatorUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1383

The data used to update Authenticators.

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1391

Limit how many Authenticators to update.

***

### where?

> `optional` **where**: [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1387

Filter which Authenticators to update
