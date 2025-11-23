[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/prisma](../README.md) / createPrismaClient

# Function: createPrismaClient()

> **createPrismaClient**(`options`): [`PrismaClient`](../type-aliases/PrismaClient.md)

Defined in: [packages/prisma/src/prisma-client.ts:10](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/prisma/src/prisma-client.ts#L10)

Create a new PrismaClient using the `@prisma/adapter-pg` adapter.
Callers must manage the client's lifecycle (reuse/disconnect) as appropriate
for their runtime (serverless vs long-lived server).

## Parameters

### options

#### connectionString

`string`

#### log?

[`LogLevel`](../namespaces/Prisma/type-aliases/LogLevel.md)[]

## Returns

[`PrismaClient`](../type-aliases/PrismaClient.md)
