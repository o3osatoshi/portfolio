[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/prisma](../README.md) / withTransaction

# Function: withTransaction()

> **withTransaction**\<`T`\>(`client`, `fn`): `Promise`\<`T`\>

Defined in: [packages/prisma/src/prisma-client.ts:25](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/prisma/src/prisma-client.ts#L25)

Convenience helper to run a callback inside a transaction.

## Type Parameters

### T

`T`

## Parameters

### client

[`PrismaClient`](../type-aliases/PrismaClient.md)

### fn

(`tx`) => `Promise`\<`T`\>

## Returns

`Promise`\<`T`\>
