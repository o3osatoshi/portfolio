[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / RedisClientOptions

# Type Alias: RedisClientOptions

> **RedisClientOptions** = `object`

Defined in: [redis-client.ts:16](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-client.ts#L16)

Connection options for constructing Upstash Redis clients.

Shared between [createRedisClient](../functions/createRedisClient.md) (Node.js/Edge) and
[createEdgeRedisClient](../functions/createEdgeRedisClient.md) (Cloudflare Workers and other
Cloudflare-compatible runtimes).

Use this to pass configuration from environment variables or other
runtime-specific sources into the client factories.

## Properties

### token?

> `optional` **token**: `string`

Defined in: [redis-client.ts:23](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-client.ts#L23)

Upstash REST API token.

This value is required by Upstash; if omitted, the underlying client
will throw at runtime when used.

***

### url?

> `optional` **url**: `string`

Defined in: [redis-client.ts:30](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/redis-client.ts#L30)

Upstash REST endpoint URL.

This value is required by Upstash; if omitted, the underlying client
will throw at runtime when used.
