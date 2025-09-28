[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorFindManyArgs

# Type Alias: AuthenticatorFindManyArgs\<ExtArgs\>

> **AuthenticatorFindManyArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1250

Authenticator findMany

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`AuthenticatorWhereUniqueInput`](AuthenticatorWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1278

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for listing Authenticators.

***

### distinct?

> `optional` **distinct**: [`AuthenticatorScalarFieldEnum`](AuthenticatorScalarFieldEnum.md) \| [`AuthenticatorScalarFieldEnum`](AuthenticatorScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1291

***

### include?

> `optional` **include**: [`AuthenticatorInclude`](AuthenticatorInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1262

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AuthenticatorOmit`](AuthenticatorOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1258

Omit specific fields from the Authenticator

***

### orderBy?

> `optional` **orderBy**: [`AuthenticatorOrderByWithRelationInput`](AuthenticatorOrderByWithRelationInput.md) \| [`AuthenticatorOrderByWithRelationInput`](AuthenticatorOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1272

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Authenticators to fetch.

***

### select?

> `optional` **select**: [`AuthenticatorSelect`](AuthenticatorSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1254

Select specific fields to fetch from the Authenticator

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1290

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Authenticators.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1284

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Authenticators from the position of the cursor.

***

### where?

> `optional` **where**: [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1266

Filter, which Authenticators to fetch.
