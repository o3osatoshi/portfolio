[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / $AuthenticatorPayload

# Type Alias: $AuthenticatorPayload\<ExtArgs\>

> **$AuthenticatorPayload**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:650

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### composites

> **composites**: `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:665

***

### name

> **name**: `"Authenticator"`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:651

***

### objects

> **objects**: `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:652

#### user

> **user**: [`$UserPayload`]($UserPayload.md)\<`ExtArgs`\>

***

### scalars

> **scalars**: `runtime.Types.Extensions.GetPayloadResult`\<\{ `counter`: `number`; `credentialBackedUp`: `boolean`; `credentialDeviceType`: `string`; `credentialID`: `string`; `credentialPublicKey`: `string`; `providerAccountId`: `string`; `transports`: `string` \| `null`; `userId`: `string`; \}, `ExtArgs`\[`"result"`\]\[`"authenticator"`\]\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:655
