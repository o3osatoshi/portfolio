[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / RateLimitDecision

# Type Alias: RateLimitDecision

> **RateLimitDecision** = `object`

Defined in: [packages/toolkit/src/rate-limit.ts:64](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L64)

Normalized decision returned by a rate-limit store.

## Properties

### allowed

> **allowed**: `boolean`

Defined in: [packages/toolkit/src/rate-limit.ts:66](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L66)

Whether this request is allowed to proceed.

***

### limit

> **limit**: `number`

Defined in: [packages/toolkit/src/rate-limit.ts:68](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L68)

Rule limit used for evaluation.

***

### remaining

> **remaining**: `number`

Defined in: [packages/toolkit/src/rate-limit.ts:70](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L70)

Remaining allowance after this request.

***

### resetEpochSeconds

> **resetEpochSeconds**: `number`

Defined in: [packages/toolkit/src/rate-limit.ts:72](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L72)

UNIX epoch seconds when the current window resets.
