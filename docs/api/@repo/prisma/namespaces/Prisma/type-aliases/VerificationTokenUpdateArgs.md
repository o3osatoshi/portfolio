[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / VerificationTokenUpdateArgs

# Type Alias: VerificationTokenUpdateArgs\<ExtArgs\>

> **VerificationTokenUpdateArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:961

VerificationToken update

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`VerificationTokenUpdateInput`](VerificationTokenUpdateInput.md), [`VerificationTokenUncheckedUpdateInput`](VerificationTokenUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:973

The data needed to update a VerificationToken.

***

### omit?

> `optional` **omit**: [`VerificationTokenOmit`](VerificationTokenOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:969

Omit specific fields from the VerificationToken

***

### select?

> `optional` **select**: [`VerificationTokenSelect`](VerificationTokenSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:965

Select specific fields to fetch from the VerificationToken

***

### where

> **where**: [`VerificationTokenWhereUniqueInput`](VerificationTokenWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:977

Choose, which VerificationToken to update.
