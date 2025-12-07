[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorCreateArgs

# Type Alias: AuthenticatorCreateArgs\<ExtArgs\>

> **AuthenticatorCreateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1298

Authenticator create

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`AuthenticatorCreateInput`](AuthenticatorCreateInput.md), [`AuthenticatorUncheckedCreateInput`](AuthenticatorUncheckedCreateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1314

The data needed to create a Authenticator.

***

### include?

> `optional` **include**: [`AuthenticatorInclude`](AuthenticatorInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1310

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AuthenticatorOmit`](AuthenticatorOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1306

Omit specific fields from the Authenticator

***

### select?

> `optional` **select**: [`AuthenticatorSelect`](AuthenticatorSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1302

Select specific fields to fetch from the Authenticator
