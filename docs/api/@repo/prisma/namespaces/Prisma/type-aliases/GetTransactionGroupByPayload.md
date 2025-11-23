[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetTransactionGroupByPayload

# Type Alias: GetTransactionGroupByPayload\<T\>

> **GetTransactionGroupByPayload**\<`T`\> = [`PrismaPromise`](PrismaPromise.md)\<[`PickEnumerable`](PickEnumerable.md)\<[`TransactionGroupByOutputType`](TransactionGroupByOutputType.md), `T`\[`"by"`\]\> & `{ [P in keyof T & keyof TransactionGroupByOutputType]: P extends "_count" ? T[P] extends boolean ? number : GetScalarType<T[P], TransactionGroupByOutputType[P]> : GetScalarType<T[P], TransactionGroupByOutputType[P]> }`[]\>

Defined in: packages/prisma/generated/prisma/models/Transaction.ts:255

## Type Parameters

### T

`T` *extends* [`TransactionGroupByArgs`](TransactionGroupByArgs.md)
