[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / createRateLimitGuard

# Function: createRateLimitGuard()

> **createRateLimitGuard**\<`T`\>(`options`): (`input`) => `ResultAsync`\<`void`, [`RichError`](../classes/RichError.md)\>

Defined in: [packages/toolkit/src/rate-limit.ts:138](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L138)

Create a reusable guard that evaluates one or more rate-limit rules.

## Type Parameters

### T

`T`

Input payload type evaluated by the guard.

## Parameters

### options

[`CreateRateLimitGuardOptions`](../type-aliases/CreateRateLimitGuardOptions.md)\<`T`\>

## Returns

A function that resolves to `Ok<void>` when all rules pass, otherwise `Err<RichError>`.

> (`input`): `ResultAsync`\<`void`, [`RichError`](../classes/RichError.md)\>

### Parameters

#### input

`T`

### Returns

`ResultAsync`\<`void`, [`RichError`](../classes/RichError.md)\>
