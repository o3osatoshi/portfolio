[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / Prisma\_\_UserClient

# Interface: Prisma\_\_UserClient\<T, Null, ExtArgs, GlobalOmitOptions\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1238

The delegate class that acts as a "Promise-like" for User.
Why is this prefixed with `Prisma__`?
Because we want to prevent naming conflicts as mentioned in
https://github.com/prisma/prisma-client-js/issues/707

## Extends

- [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`T`\>

## Type Parameters

### T

`T`

### Null

`Null` = `never`

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

### GlobalOmitOptions

`GlobalOmitOptions` = \{ \}

## Properties

### \[toStringTag\]

> `readonly` **\[toStringTag\]**: `"PrismaPromise"`

Defined in: packages/prisma/generated/prisma/models/User.ts:1239

#### Overrides

`Prisma.PrismaPromise.[toStringTag]`

## Methods

### accounts()

> **accounts**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`Null` \| `GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1240

#### Type Parameters

##### T

`T` *extends* [`User$accountsArgs`](../type-aliases/User$accountsArgs.md)\<`ExtArgs`\> = \{ \}

#### Parameters

##### args?

[`Subset`](../type-aliases/Subset.md)\<`T`, [`User$accountsArgs`](../type-aliases/User$accountsArgs.md)\<`ExtArgs`\>\>

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`Null` \| `GetFindResult`\<[`$AccountPayload`](../type-aliases/$AccountPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

***

### Authenticator()

> **Authenticator**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`Null` \| `GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1242

#### Type Parameters

##### T

`T` *extends* [`User$AuthenticatorArgs`](../type-aliases/User$AuthenticatorArgs.md)\<`ExtArgs`\> = \{ \}

#### Parameters

##### args?

[`Subset`](../type-aliases/Subset.md)\<`T`, [`User$AuthenticatorArgs`](../type-aliases/User$AuthenticatorArgs.md)\<`ExtArgs`\>\>

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`Null` \| `GetFindResult`\<[`$AuthenticatorPayload`](../type-aliases/$AuthenticatorPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

***

### catch()

> **catch**\<`TResult`\>(`onrejected?`): `Promise`\<`T` \| `TResult`\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1256

Attaches a callback for only the rejection of the Promise.

#### Type Parameters

##### TResult

`TResult` = `never`

#### Parameters

##### onrejected?

The callback to execute when the Promise is rejected.

`null` | (`reason`) => `TResult` \| `PromiseLike`\<`TResult`\>

#### Returns

`Promise`\<`T` \| `TResult`\>

A Promise for the completion of the callback.

#### Overrides

`Prisma.PrismaPromise.catch`

***

### finally()

> **finally**(`onfinally?`): `Promise`\<`T`\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1263

Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
resolved value cannot be modified from the callback.

#### Parameters

##### onfinally?

The callback to execute when the Promise is settled (fulfilled or rejected).

`null` | () => `void`

#### Returns

`Promise`\<`T`\>

A Promise for the completion of the callback.

#### Overrides

`Prisma.PrismaPromise.finally`

***

### sessions()

> **sessions**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`Null` \| `GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1241

#### Type Parameters

##### T

`T` *extends* [`User$sessionsArgs`](../type-aliases/User$sessionsArgs.md)\<`ExtArgs`\> = \{ \}

#### Parameters

##### args?

[`Subset`](../type-aliases/Subset.md)\<`T`, [`User$sessionsArgs`](../type-aliases/User$sessionsArgs.md)\<`ExtArgs`\>\>

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`Null` \| `GetFindResult`\<[`$SessionPayload`](../type-aliases/$SessionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

***

### then()

> **then**\<`TResult1`, `TResult2`\>(`onfulfilled?`, `onrejected?`): `Promise`\<`TResult1` \| `TResult2`\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1250

Attaches callbacks for the resolution and/or rejection of the Promise.

#### Type Parameters

##### TResult1

`TResult1` = `T`

##### TResult2

`TResult2` = `never`

#### Parameters

##### onfulfilled?

The callback to execute when the Promise is resolved.

`null` | (`value`) => `TResult1` \| `PromiseLike`\<`TResult1`\>

##### onrejected?

The callback to execute when the Promise is rejected.

`null` | (`reason`) => `TResult2` \| `PromiseLike`\<`TResult2`\>

#### Returns

`Promise`\<`TResult1` \| `TResult2`\>

A Promise for the completion of which ever callback is executed.

#### Overrides

`Prisma.PrismaPromise.then`

***

### transactions()

> **transactions**\<`T`\>(`args?`): [`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`Null` \| `GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>

Defined in: packages/prisma/generated/prisma/models/User.ts:1243

#### Type Parameters

##### T

`T` *extends* [`User$transactionsArgs`](../type-aliases/User$transactionsArgs.md)\<`ExtArgs`\> = \{ \}

#### Parameters

##### args?

[`Subset`](../type-aliases/Subset.md)\<`T`, [`User$transactionsArgs`](../type-aliases/User$transactionsArgs.md)\<`ExtArgs`\>\>

#### Returns

[`PrismaPromise`](../type-aliases/PrismaPromise.md)\<`Null` \| `GetFindResult`\<[`$TransactionPayload`](../type-aliases/$TransactionPayload.md)\<`ExtArgs`\>, `T`, `GlobalOmitOptions`\>[]\>
