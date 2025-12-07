[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorFindFirstArgs

# Type Alias: AuthenticatorFindFirstArgs\<ExtArgs\>

> **AuthenticatorFindFirstArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1147

Authenticator findFirst

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`AuthenticatorWhereUniqueInput`](AuthenticatorWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1175

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for searching for Authenticators.

***

### distinct?

> `optional` **distinct**: [`AuthenticatorScalarFieldEnum`](AuthenticatorScalarFieldEnum.md) \| [`AuthenticatorScalarFieldEnum`](AuthenticatorScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1193

[Distinct Docs](https://www.prisma.io/docs/concepts/components/prisma-client/distinct)

Filter by unique combinations of Authenticators.

***

### include?

> `optional` **include**: [`AuthenticatorInclude`](AuthenticatorInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1159

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`AuthenticatorOmit`](AuthenticatorOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1155

Omit specific fields from the Authenticator

***

### orderBy?

> `optional` **orderBy**: [`AuthenticatorOrderByWithRelationInput`](AuthenticatorOrderByWithRelationInput.md) \| [`AuthenticatorOrderByWithRelationInput`](AuthenticatorOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1169

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Authenticators to fetch.

***

### select?

> `optional` **select**: [`AuthenticatorSelect`](AuthenticatorSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1151

Select specific fields to fetch from the Authenticator

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1187

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Authenticators.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1181

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Authenticators from the position of the cursor.

***

### where?

> `optional` **where**: [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1163

Filter, which Authenticator to fetch.
