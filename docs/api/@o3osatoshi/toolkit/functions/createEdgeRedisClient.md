[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / createEdgeRedisClient

# Function: createEdgeRedisClient()

> **createEdgeRedisClient**(`options?`): `Redis`

Defined in: [redis-client.ts:45](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-client.ts#L45)

Create an Upstash Redis client for Cloudflare Workers / Edge runtimes.

This helper is a thin wrapper around `new EdgeRedis(...)` from
`@upstash/redis/cloudflare` that accepts the connection URL and token
via [RedisClientOptions](../type-aliases/RedisClientOptions.md).

## Parameters

### options?

[`RedisClientOptions`](../type-aliases/RedisClientOptions.md)

Connection settings (URL and token) for the Redis client.

## Returns

`Redis`

A configured Cloudflare-compatible `Redis` client instance.
