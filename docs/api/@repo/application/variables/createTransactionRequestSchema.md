[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / createTransactionRequestSchema

# Variable: createTransactionRequestSchema

> `const` **createTransactionRequestSchema**: `ZodObject`\<\{ `amount`: `ZodString`; `currency`: `ZodString`; `datetime`: `ZodCoercedDate`\<`unknown`\>; `fee`: `ZodOptional`\<`ZodString`\>; `feeCurrency`: `ZodOptional`\<`ZodString`\>; `price`: `ZodString`; `profitLoss`: `ZodOptional`\<`ZodString`\>; `type`: `ZodEnum`\<\{ `BUY`: `"BUY"`; `SELL`: `"SELL"`; \}\>; `userId`: `ZodString`; \}, `$strip`\>

Defined in: [packages/application/src/dtos/transaction.req.dto.ts:30](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/application/src/dtos/transaction.req.dto.ts#L30)

Schema describing the payload required to create a transaction from the API.
