[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / createRedisClient

# Function: createRedisClient()

> **createRedisClient**(`options?`): `Redis`

Defined in: [redis-client.ts:62](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-client.ts#L62)

Create an Upstash Redis client configured for Node.js / generic Edge runtimes.

This helper is a thin wrapper around `new Redis(...)` that accepts the
connection URL and token via [RedisClientOptions](../type-aliases/RedisClientOptions.md). Callers are
responsible for reading configuration (for example, from environment
variables) before invoking this function.

## Parameters

### options?

[`RedisClientOptions`](../type-aliases/RedisClientOptions.md)

Connection settings (URL and token) for the Redis client.

## Returns

`Redis`

A configured `Redis` client instance.
