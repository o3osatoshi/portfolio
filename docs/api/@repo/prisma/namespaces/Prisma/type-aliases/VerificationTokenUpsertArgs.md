[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / VerificationTokenUpsertArgs

# Type Alias: VerificationTokenUpsertArgs\<ExtArgs\>

> **VerificationTokenUpsertArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1027

VerificationToken upsert

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### create

> **create**: [`XOR`](XOR.md)\<[`VerificationTokenCreateInput`](VerificationTokenCreateInput.md), [`VerificationTokenUncheckedCreateInput`](VerificationTokenUncheckedCreateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1043

In case the VerificationToken found by the `where` argument doesn't exist, create a new VerificationToken with this data.

***

### omit?

> `optional` **omit**: [`VerificationTokenOmit`](VerificationTokenOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1035

Omit specific fields from the VerificationToken

***

### select?

> `optional` **select**: [`VerificationTokenSelect`](VerificationTokenSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1031

Select specific fields to fetch from the VerificationToken

***

### update

> **update**: [`XOR`](XOR.md)\<[`VerificationTokenUpdateInput`](VerificationTokenUpdateInput.md), [`VerificationTokenUncheckedUpdateInput`](VerificationTokenUncheckedUpdateInput.md)\>

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1047

In case the VerificationToken was found with the provided `where` argument, update it with this data.

***

### where

> **where**: [`VerificationTokenWhereUniqueInput`](VerificationTokenWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:1039

The filter to search for the VerificationToken to update in case it exists.
