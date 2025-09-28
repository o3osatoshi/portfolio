[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / VerificationTokenFindFirstArgs

# Type Alias: VerificationTokenFindFirstArgs\<ExtArgs\>

> **VerificationTokenFindFirstArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:773

VerificationToken findFirst

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`VerificationTokenWhereUniqueInput`](VerificationTokenWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:797

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for searching for VerificationTokens.

***

### distinct?

> `optional` **distinct**: [`VerificationTokenScalarFieldEnum`](VerificationTokenScalarFieldEnum.md) \| [`VerificationTokenScalarFieldEnum`](VerificationTokenScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:815

[Distinct Docs](https://www.prisma.io/docs/concepts/components/prisma-client/distinct)

Filter by unique combinations of VerificationTokens.

***

### omit?

> `optional` **omit**: [`VerificationTokenOmit`](VerificationTokenOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:781

Omit specific fields from the VerificationToken

***

### orderBy?

> `optional` **orderBy**: [`VerificationTokenOrderByWithRelationInput`](VerificationTokenOrderByWithRelationInput.md) \| [`VerificationTokenOrderByWithRelationInput`](VerificationTokenOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:791

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of VerificationTokens to fetch.

***

### select?

> `optional` **select**: [`VerificationTokenSelect`](VerificationTokenSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:777

Select specific fields to fetch from the VerificationToken

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:809

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` VerificationTokens.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:803

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` VerificationTokens from the position of the cursor.

***

### where?

> `optional` **where**: [`VerificationTokenWhereInput`](VerificationTokenWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/VerificationToken.ts:785

Filter, which VerificationToken to fetch.
