[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / AuthenticatorUpdateManyAndReturnArgs

# Type Alias: AuthenticatorUpdateManyAndReturnArgs\<ExtArgs\>

> **AuthenticatorUpdateManyAndReturnArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1398

Authenticator updateManyAndReturn

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### data

> **data**: [`XOR`](XOR.md)\<[`AuthenticatorUpdateManyMutationInput`](AuthenticatorUpdateManyMutationInput.md), [`AuthenticatorUncheckedUpdateManyInput`](AuthenticatorUncheckedUpdateManyInput.md)\>

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1410

The data used to update Authenticators.

***

### include?

> `optional` **include**: [`AuthenticatorIncludeUpdateManyAndReturn`](AuthenticatorIncludeUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1422

Choose, which related nodes to fetch as well

***

### limit?

> `optional` **limit**: `number`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1418

Limit how many Authenticators to update.

***

### omit?

> `optional` **omit**: [`AuthenticatorOmit`](AuthenticatorOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1406

Omit specific fields from the Authenticator

***

### select?

> `optional` **select**: [`AuthenticatorSelectUpdateManyAndReturn`](AuthenticatorSelectUpdateManyAndReturn.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1402

Select specific fields to fetch from the Authenticator

***

### where?

> `optional` **where**: [`AuthenticatorWhereInput`](AuthenticatorWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:1414

Filter which Authenticators to update
