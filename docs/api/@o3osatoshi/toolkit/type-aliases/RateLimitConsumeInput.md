[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / RateLimitConsumeInput

# Type Alias: RateLimitConsumeInput

> **RateLimitConsumeInput** = `object`

Defined in: [packages/toolkit/src/rate-limit.ts:48](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L48)

Input payload consumed by a rate-limit store implementation.

## Properties

### bucket

> **bucket**: `string`

Defined in: [packages/toolkit/src/rate-limit.ts:50](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L50)

Stable bucket key, usually mapped from rule id.

***

### identifier

> **identifier**: `string`

Defined in: [packages/toolkit/src/rate-limit.ts:52](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L52)

Identifier to rate-limit within the bucket (for example user id).

***

### limit

> **limit**: `number`

Defined in: [packages/toolkit/src/rate-limit.ts:54](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L54)

Maximum number of allowed requests in the rule window.

***

### windowSeconds

> **windowSeconds**: `number`

Defined in: [packages/toolkit/src/rate-limit.ts:56](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L56)

Sliding/fixed window size in seconds, depending on store implementation.
