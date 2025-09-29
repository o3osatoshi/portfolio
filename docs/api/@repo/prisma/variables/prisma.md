[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/prisma](../README.md) / prisma

# Variable: prisma

> `const` **prisma**: [`PrismaClient`](../type-aliases/PrismaClient.md)

Defined in: [packages/prisma/src/prisma-client.ts:14](https://github.com/o3osatoshi/experiment/blob/f1d231870a1d13a36a9ead236d22edc1fb9797dd/packages/prisma/src/prisma-client.ts#L14)

Singleton Prisma client using the `@prisma/adapter-pg` adapter. Reuses the
instance on subsequent imports during development to avoid exhausting
database connections.
