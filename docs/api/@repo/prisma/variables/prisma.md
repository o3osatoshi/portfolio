[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/prisma](../README.md) / prisma

# Variable: prisma

> `const` **prisma**: [`PrismaClient`](../type-aliases/PrismaClient.md)

Defined in: [packages/prisma/src/prisma-client.ts:14](https://github.com/o3osatoshi/experiment/blob/04dfa58df6e48824a200a24d77afef7ce464e1ae/packages/prisma/src/prisma-client.ts#L14)

Singleton Prisma client using the `@prisma/adapter-pg` adapter. Reuses the
instance on subsequent imports during development to avoid exhausting
database connections.
