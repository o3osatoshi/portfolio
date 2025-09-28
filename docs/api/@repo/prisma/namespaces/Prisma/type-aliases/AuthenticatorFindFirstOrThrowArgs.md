[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorFindFirstOrThrowArgs

# Type Alias: AuthenticatorFindFirstOrThrowArgs\<ExtArgs\>

> **AuthenticatorFindFirstOrThrowArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1198

Authenticator findFirstOrThrow

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`AuthenticatorWhereUniqueInput`](AuthenticatorWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1226

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for searching for Authenticators.

***

### distinct?

> `optional` **distinct**: [`AuthenticatorScalarFieldEnum`](AuthenticatorScalarFieldEnum.md) \| [`AuthenticatorScalarFieldEnum`](AuthenticatorScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1244

[Distinct Docs](https://www.prisma.io/docs/concepts/components/prisma-client/distinct)

Filter by unique combinations of Authenticators.

***

### include?

> `optional` **include**: [`AuthenticatorInclude`](AuthenticatorInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1210

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AuthenticatorOmit`](AuthenticatorOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1206

Omit specific fields from the Authenticator

***

### orderBy?

> `optional` **orderBy**: [`AuthenticatorOrderByWithRelationInput`](AuthenticatorOrderByWithRelationInput.md) \| [`AuthenticatorOrderByWithRelationInput`](AuthenticatorOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1220

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Authenticators to fetch.

***

### select?

> `optional` **select**: [`AuthenticatorSelect`](AuthenticatorSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1202

Select specific fields to fetch from the Authenticator

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1238

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Authenticators.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1232

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Authenticators from the position of the cursor.

***

### where?

> `optional` **where**: [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1214

Filter, which Authenticator to fetch.
