[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / HeavyProcessCachedUseCase

# Class: HeavyProcessCachedUseCase

Defined in: [packages/application/src/use-cases/toolkit/heavy-process-cached.ts:15](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/application/src/use-cases/toolkit/heavy-process-cached.ts#L15)

## Constructors

### Constructor

> **new HeavyProcessCachedUseCase**(`redisClient`): `HeavyProcessCachedUseCase`

Defined in: [packages/application/src/use-cases/toolkit/heavy-process-cached.ts:16](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/application/src/use-cases/toolkit/heavy-process-cached.ts#L16)

#### Parameters

##### redisClient

`Redis` | `Redis`

#### Returns

`HeavyProcessCachedUseCase`

## Methods

### execute()

> **execute**(): `ResultAsync`\<\{ `cached`: `boolean`; `timestamp`: `Date`; \}, `Error`\>

Defined in: [packages/application/src/use-cases/toolkit/heavy-process-cached.ts:33](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/application/src/use-cases/toolkit/heavy-process-cached.ts#L33)

Execute a heavy process with Redis-backed caching.

- Attempts to read a [HeavyProcessResponse](../type-aliases/HeavyProcessResponse.md) from Redis using
  HEAVY\_PROCESS\_CACHE\_KEY.
- When a cached value exists, it returns the cached payload with
  `cached: true`.
- When no cached value exists, it simulates a heavy computation by
  sleeping for 3 seconds, writes the result to Redis with
  HEAVY\_PROCESS\_CACHE\_TTL\_MS, and returns the payload with
  `cached: false`.

#### Returns

`ResultAsync`\<\{ `cached`: `boolean`; `timestamp`: `Date`; \}, `Error`\>

ResultAsync wrapping a [HeavyProcessCachedResponse](../type-aliases/HeavyProcessCachedResponse.md) or an
Error if the underlying Redis or sleep operations fail.
