[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / updateTransactionRequestSchema

# Variable: updateTransactionRequestSchema

> `const` **updateTransactionRequestSchema**: `ZodObject`\<\{ `amount`: `ZodOptional`\<`ZodString`\>; `currency`: `ZodOptional`\<`ZodString`\>; `datetime`: `ZodOptional`\<`ZodCoercedDate`\<`unknown`\>\>; `fee`: `ZodOptional`\<`ZodString`\>; `feeCurrency`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `price`: `ZodOptional`\<`ZodString`\>; `profitLoss`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodEnum`\<\{ `BUY`: `"BUY"`; `SELL`: `"SELL"`; \}\>\>; \}, `$strip`\>

Defined in: [packages/application/src/dtos/transaction.req.dto.ts:48](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/application/src/dtos/transaction.req.dto.ts#L48)

Schema describing partial updates allowed on an existing transaction.
