[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / CreateRateLimitGuardOptions

# Type Alias: CreateRateLimitGuardOptions\<T\>

> **CreateRateLimitGuardOptions**\<`T`\> = `object`

Defined in: [packages/toolkit/src/rate-limit.ts:12](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L12)

Options for creating a reusable rate-limit guard.

## Type Parameters

### T

`T`

Input payload type evaluated by the guard.

## Properties

### buildRateLimitedError()?

> `optional` **buildRateLimitedError**: (`ctx`) => [`RichError`](../classes/RichError.md)

Defined in: [packages/toolkit/src/rate-limit.ts:14](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L14)

Factory for customizing the error returned when a rule is exceeded.

#### Parameters

##### ctx

[`RateLimitExceededContext`](RateLimitExceededContext.md)\<`T`\>

#### Returns

[`RichError`](../classes/RichError.md)

***

### failureMode?

> `optional` **failureMode**: [`RateLimitFailureMode`](RateLimitFailureMode.md)

Defined in: [packages/toolkit/src/rate-limit.ts:18](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L18)

Store-failure handling strategy. Defaults to `"fail-closed"`.

***

### onBypass()?

> `optional` **onBypass**: (`ctx`) => `void`

Defined in: [packages/toolkit/src/rate-limit.ts:20](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L20)

Callback invoked when a store failure is bypassed in `"fail-open"` mode.

#### Parameters

##### ctx

[`RateLimitBypassContext`](RateLimitBypassContext.md)\<`T`\>

#### Returns

`void`

***

### rules

> **rules**: [`RateLimitRule`](RateLimitRule.md)\<`T`\>[]

Defined in: [packages/toolkit/src/rate-limit.ts:22](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L22)

Ordered list of rules to evaluate for each input.

***

### store

> **store**: [`RateLimitStore`](RateLimitStore.md)

Defined in: [packages/toolkit/src/rate-limit.ts:24](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L24)

Backend store used to consume rule counters.
