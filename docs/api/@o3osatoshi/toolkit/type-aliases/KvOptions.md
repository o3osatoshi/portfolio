[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / KvOptions

# Type Alias: KvOptions

> **KvOptions** = `object`

Defined in: [redis-cache.ts:11](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-cache.ts#L11)

Options to control how cache keys are constructed.

## Properties

### prefix?

> `optional` **prefix**: `string`

Defined in: [redis-cache.ts:16](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-cache.ts#L16)

Prefix applied to every key to create a logical namespace.
The final key becomes `${prefix}:${key}` when a prefix is provided.
