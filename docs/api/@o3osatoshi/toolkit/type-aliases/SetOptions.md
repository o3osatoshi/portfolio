[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / SetOptions

# Type Alias: SetOptions

> **SetOptions** = `object`

Defined in: [redis-cache.ts:26](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-cache.ts#L26)

Options for conditional `SET` behavior and expiration.

Mirrors the `NX` / `XX` and `PX` flags exposed by Upstash Redis.

## Properties

### onlyIfAbsent?

> `optional` **onlyIfAbsent**: `boolean`

Defined in: [redis-cache.ts:28](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-cache.ts#L28)

Set only if the key does not already exist (NX).

***

### onlyIfPresent?

> `optional` **onlyIfPresent**: `boolean`

Defined in: [redis-cache.ts:30](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-cache.ts#L30)

Set only if the key already exists (XX).

***

### ttlMs?

> `optional` **ttlMs**: `number`

Defined in: [redis-cache.ts:32](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-cache.ts#L32)

Time to live in milliseconds (PX). If omitted, the key is persistent.
