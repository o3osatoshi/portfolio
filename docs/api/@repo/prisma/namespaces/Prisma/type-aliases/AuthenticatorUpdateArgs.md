[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorUpdateArgs

# Type Alias: AuthenticatorUpdateArgs\<ExtArgs\>

> **AuthenticatorUpdateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1353

Authenticator update

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`AuthenticatorUpdateInput`](AuthenticatorUpdateInput.md), [`AuthenticatorUncheckedUpdateInput`](AuthenticatorUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1369

The data needed to update a Authenticator.

***

### include?

> `optional` **include**: [`AuthenticatorInclude`](AuthenticatorInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1365

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AuthenticatorOmit`](AuthenticatorOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1361

Omit specific fields from the Authenticator

***

### select?

> `optional` **select**: [`AuthenticatorSelect`](AuthenticatorSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1357

Select specific fields to fetch from the Authenticator

***

### where

> **where**: [`AuthenticatorWhereUniqueInput`](AuthenticatorWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1373

Choose, which Authenticator to update.
