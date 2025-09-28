[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorWhereInput

# Type Alias: AuthenticatorWhereInput

> **AuthenticatorWhereInput** = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:230

## Properties

### AND?

> `optional` **AND**: `Prisma.AuthenticatorWhereInput` \| `Prisma.AuthenticatorWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:231

***

### counter?

> `optional` **counter**: [`IntFilter`](IntFilter.md)\<`"Authenticator"`\> \| `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:238

***

### credentialBackedUp?

> `optional` **credentialBackedUp**: [`BoolFilter`](BoolFilter.md)\<`"Authenticator"`\> \| `boolean`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:240

***

### credentialDeviceType?

> `optional` **credentialDeviceType**: [`StringFilter`](StringFilter.md)\<`"Authenticator"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:239

***

### credentialID?

> `optional` **credentialID**: [`StringFilter`](StringFilter.md)\<`"Authenticator"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:234

***

### credentialPublicKey?

> `optional` **credentialPublicKey**: [`StringFilter`](StringFilter.md)\<`"Authenticator"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:237

***

### NOT?

> `optional` **NOT**: `Prisma.AuthenticatorWhereInput` \| `Prisma.AuthenticatorWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:233

***

### OR?

> `optional` **OR**: `Prisma.AuthenticatorWhereInput`[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:232

***

### providerAccountId?

> `optional` **providerAccountId**: [`StringFilter`](StringFilter.md)\<`"Authenticator"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:236

***

### transports?

> `optional` **transports**: [`StringNullableFilter`](StringNullableFilter.md)\<`"Authenticator"`\> \| `string` \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:241

***

### user?

> `optional` **user**: [`XOR`](XOR.md)\<[`UserScalarRelationFilter`](UserScalarRelationFilter.md), [`UserWhereInput`](UserWhereInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:242

***

### userId?

> `optional` **userId**: [`StringFilter`](StringFilter.md)\<`"Authenticator"`\> \| `string`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:235
