[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorUpsertArgs

# Type Alias: AuthenticatorUpsertArgs\<ExtArgs\>

> **AuthenticatorUpsertArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1427

Authenticator upsert

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### create

> **create**: [`XOR`](XOR.md)\<[`AuthenticatorCreateInput`](AuthenticatorCreateInput.md), [`AuthenticatorUncheckedCreateInput`](AuthenticatorUncheckedCreateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1447

In case the Authenticator found by the `where` argument doesn't exist, create a new Authenticator with this data.

***

### include?

> `optional` **include**: [`AuthenticatorInclude`](AuthenticatorInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1439

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AuthenticatorOmit`](AuthenticatorOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1435

Omit specific fields from the Authenticator

***

### select?

> `optional` **select**: [`AuthenticatorSelect`](AuthenticatorSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1431

Select specific fields to fetch from the Authenticator

***

### update

> **update**: [`XOR`](XOR.md)\<[`AuthenticatorUpdateInput`](AuthenticatorUpdateInput.md), [`AuthenticatorUncheckedUpdateInput`](AuthenticatorUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1451

In case the Authenticator was found with the provided `where` argument, update it with this data.

***

### where

> **where**: [`AuthenticatorWhereUniqueInput`](AuthenticatorWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1443

The filter to search for the Authenticator to update in case it exists.
