[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / kvSet

# Function: kvSet()

> **kvSet**\<`T`\>(`redis`, `key`, `value`, `options`, `opt`): `ResultAsync`\<`T` \| `"OK"` \| `null`, `Error`\>

Defined in: [redis-cache.ts:88](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-cache.ts#L88)

Stores a value at `key`, supporting TTL and conditional semantics.

The underlying Upstash Redis client is responsible for serialization; this
helper simply forwards the value as-is and wraps the operation in a
ResultAsync.

## Type Parameters

### T

`T`

Value type to store at the key.

## Parameters

### redis

`Redis`

Upstash Redis client instance.

### key

Cache key (number or string).

`string` | `number`

### value

`T`

Value to store.

### options

[`SetOptions`](../type-aliases/SetOptions.md) = `{}`

Conditional and expiration options (NX/XX, PX).

### opt

[`KvOptions`](../type-aliases/KvOptions.md) = `{}`

Key construction options (e.g. `prefix`).

## Returns

`ResultAsync`\<`T` \| `"OK"` \| `null`, `Error`\>

A ResultAsync whose success branch resolves to:
- `"OK"` when the underlying Redis `SET` command completes and acknowledges the write.
- `null` when a condition such as `NX` / `XX` prevents the value from being written (e.g. key already exists with `NX`).
- `T` for alternative client implementations that choose to return the stored value itself instead of `"OK"`; with Upstash Redis, this branch is not used and results are always `"OK"` or `null`.
