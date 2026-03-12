[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / RateLimitStore

# Type Alias: RateLimitStore

> **RateLimitStore** = `object`

Defined in: [packages/toolkit/src/rate-limit.ts:121](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L121)

Storage abstraction for consuming rate-limit tokens.

## Methods

### consume()

> **consume**(`input`): `ResultAsync`\<[`RateLimitDecision`](RateLimitDecision.md), [`RichError`](../classes/RichError.md)\>

Defined in: [packages/toolkit/src/rate-limit.ts:125](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/rate-limit.ts#L125)

Consume one request from the target bucket/identifier pair.

#### Parameters

##### input

[`RateLimitConsumeInput`](RateLimitConsumeInput.md)

#### Returns

`ResultAsync`\<[`RateLimitDecision`](RateLimitDecision.md), [`RichError`](../classes/RichError.md)\>
