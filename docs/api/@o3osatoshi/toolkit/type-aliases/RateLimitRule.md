[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / RateLimitRule

# Type Alias: RateLimitRule\<T\>

> **RateLimitRule**\<`T`\> = `object`

Defined in: [packages/toolkit/src/rate-limit.ts:105](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L105)

Declarative rule evaluated by a rate-limit guard.

## Type Parameters

### T

`T`

Input payload type evaluated by the guard.

## Properties

### id

> **id**: `string`

Defined in: [packages/toolkit/src/rate-limit.ts:107](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L107)

Stable rule identifier used for diagnostics and bucket naming.

***

### limit

> **limit**: `number`

Defined in: [packages/toolkit/src/rate-limit.ts:109](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L109)

Maximum number of allowed requests in each window.

***

### windowSeconds

> **windowSeconds**: `number`

Defined in: [packages/toolkit/src/rate-limit.ts:113](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L113)

Rule window size in seconds.

## Methods

### resolveIdentifier()

> **resolveIdentifier**(`input`): `string`

Defined in: [packages/toolkit/src/rate-limit.ts:111](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L111)

Function that maps input payload into a per-rule identifier.

#### Parameters

##### input

`T`

#### Returns

`string`
