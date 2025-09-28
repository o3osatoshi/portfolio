[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / $UserPayload

# Type Alias: $UserPayload\<ExtArgs\>

> **$UserPayload**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/User.ts:830

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### composites

> **composites**: `object`

Defined in: packages/prisma/generated/prisma/models/User.ts:847

***

### name

> **name**: `"User"`

Defined in: packages/prisma/generated/prisma/models/User.ts:831

***

### objects

> **objects**: `object`

Defined in: packages/prisma/generated/prisma/models/User.ts:832

#### accounts

> **accounts**: [`$AccountPayload`]($AccountPayload.md)\<`ExtArgs`\>[]

#### Authenticator

> **Authenticator**: [`$AuthenticatorPayload`]($AuthenticatorPayload.md)\<`ExtArgs`\>[]

#### sessions

> **sessions**: [`$SessionPayload`]($SessionPayload.md)\<`ExtArgs`\>[]

#### transactions

> **transactions**: [`$TransactionPayload`]($TransactionPayload.md)\<`ExtArgs`\>[]

***

### scalars

> **scalars**: `runtime.Types.Extensions.GetPayloadResult`\<\{ `createdAt`: `Date`; `email`: `string`; `emailVerified`: `Date` \| `null`; `id`: `string`; `image`: `string` \| `null`; `name`: `string` \| `null`; `updatedAt`: `Date`; \}, `ExtArgs`\[`"result"`\]\[`"user"`\]\>

Defined in: packages/prisma/generated/prisma/models/User.ts:838
