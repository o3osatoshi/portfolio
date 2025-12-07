[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / kvGet

# Function: kvGet()

> **kvGet**\<`T`\>(`redis`, `key`, `opt`): `ResultAsync`\<`T` \| `null`, `Error`\>

Defined in: [redis-cache.ts:49](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-cache.ts#L49)

Retrieves a value by key from Upstash Redis.

If the key does not exist, the result resolves to `null`. If the underlying
Redis request fails, the error branch contains an `InfraUnavailableError`
created via [newError](newError.md).

## Type Parameters

### T

`T`

Expected value shape stored at the key.

## Parameters

### redis

`Redis`

Upstash Redis client instance.

### key

Cache key (number or string).

`string` | `number`

### opt

[`KvOptions`](../type-aliases/KvOptions.md) = `{}`

Key construction options (e.g. `prefix`).

## Returns

`ResultAsync`\<`T` \| `null`, `Error`\>

A ResultAsync that yields `T | null` on success or a structured error on failure.
