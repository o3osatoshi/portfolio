[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / VerificationTokenUpdateManyAndReturnArgs

# Type Alias: VerificationTokenUpdateManyAndReturnArgs\<ExtArgs\>

> **VerificationTokenUpdateManyAndReturnArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1001

VerificationToken updateManyAndReturn

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`VerificationTokenUpdateManyMutationInput`](VerificationTokenUpdateManyMutationInput.md), [`VerificationTokenUncheckedUpdateManyInput`](VerificationTokenUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1013

The data used to update VerificationTokens.

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1021

Limit how many VerificationTokens to update.

***

### omit?

> `optional` **omit**: [`VerificationTokenOmit`](VerificationTokenOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1009

Omit specific fields from the VerificationToken

***

### select?

> `optional` **select**: [`VerificationTokenSelectUpdateManyAndReturn`](VerificationTokenSelectUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1005

Select specific fields to fetch from the VerificationToken

***

### where?

> `optional` **where**: [`VerificationTokenWhereInput`](VerificationTokenWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1017

Filter which VerificationTokens to update
