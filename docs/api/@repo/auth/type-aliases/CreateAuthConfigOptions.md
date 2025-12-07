[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/auth](../README.md) / CreateAuthConfigOptions

# Type Alias: CreateAuthConfigOptions

> **CreateAuthConfigOptions** = `object`

Defined in: [packages/auth/src/hono-auth/index.ts:8](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/auth/src/hono-auth/index.ts#L8)

## Properties

### basePath?

> `optional` **basePath**: `string`

Defined in: [packages/auth/src/hono-auth/index.ts:9](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/auth/src/hono-auth/index.ts#L9)

***

### prismaClient?

> `optional` **prismaClient**: [`PrismaClient`](../../prisma/type-aliases/PrismaClient.md)

Defined in: [packages/auth/src/hono-auth/index.ts:10](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/auth/src/hono-auth/index.ts#L10)

***

### providers?

> `optional` **providers**: `{ [key in AuthProviderId]: { clientId: string; clientSecret: string } }`

Defined in: [packages/auth/src/hono-auth/index.ts:11](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/auth/src/hono-auth/index.ts#L11)

***

### secret

> **secret**: `string`

Defined in: [packages/auth/src/hono-auth/index.ts:17](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/auth/src/hono-auth/index.ts#L17)

***

### session?

> `optional` **session**: `object`

Defined in: [packages/auth/src/hono-auth/index.ts:18](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/auth/src/hono-auth/index.ts#L18)

#### strategy?

> `optional` **strategy**: `"database"` \| `"jwt"`
