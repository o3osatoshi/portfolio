[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / RateLimitExceededContext

# Type Alias: RateLimitExceededContext\<T\>

> **RateLimitExceededContext**\<`T`\> = `object`

Defined in: [packages/toolkit/src/rate-limit.ts:82](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L82)

Context used to build a custom rate-limited error.

## Type Parameters

### T

`T`

Input payload type evaluated by the guard.

## Properties

### decision

> **decision**: [`RateLimitDecision`](RateLimitDecision.md)

Defined in: [packages/toolkit/src/rate-limit.ts:84](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L84)

Decision returned by the store when the rule was evaluated.

***

### input

> **input**: `T`

Defined in: [packages/toolkit/src/rate-limit.ts:86](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L86)

Guard input that triggered the exceeded decision.

***

### rule

> **rule**: [`RateLimitRule`](RateLimitRule.md)\<`T`\>

Defined in: [packages/toolkit/src/rate-limit.ts:88](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L88)

Rule that produced the exceeded decision.
