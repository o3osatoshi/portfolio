[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / RateLimitBypassContext

# Type Alias: RateLimitBypassContext\<T\>

> **RateLimitBypassContext**\<`T`\> = `object`

Defined in: [packages/toolkit/src/rate-limit.ts:34](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L34)

Context passed to `onBypass` when a store failure is bypassed in fail-open mode.

## Type Parameters

### T

`T`

Input payload type evaluated by the guard.

## Properties

### error

> **error**: [`RichError`](../classes/RichError.md)

Defined in: [packages/toolkit/src/rate-limit.ts:36](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L36)

Original store failure that triggered bypass handling.

***

### input

> **input**: `T`

Defined in: [packages/toolkit/src/rate-limit.ts:38](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L38)

Guard input associated with the failed store call.

***

### rule

> **rule**: [`RateLimitRule`](RateLimitRule.md)\<`T`\>

Defined in: [packages/toolkit/src/rate-limit.ts:40](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L40)

Rule being evaluated when the store failure occurred.
