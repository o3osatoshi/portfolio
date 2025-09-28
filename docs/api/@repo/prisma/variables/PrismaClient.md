[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/prisma](../README.md) / PrismaClient

# Variable: PrismaClient

> `const` **PrismaClient**: `PrismaClientConstructor`

Defined in: packages/prisma/generated/prisma/client.ts:37

## Prisma Client

Type-safe database client for TypeScript

## Example

```
const prisma = new PrismaClient()
// Fetch zero or more Transactions
const transactions = await prisma.transaction.findMany()
```

Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
