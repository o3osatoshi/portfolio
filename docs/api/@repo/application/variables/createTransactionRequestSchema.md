[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / createTransactionRequestSchema

# Variable: createTransactionRequestSchema

> `const` **createTransactionRequestSchema**: `ZodObject`\<\{ `amount`: `ZodString`; `currency`: `ZodString`; `datetime`: `ZodCoercedDate`\<`unknown`\>; `fee`: `ZodOptional`\<`ZodString`\>; `feeCurrency`: `ZodOptional`\<`ZodString`\>; `price`: `ZodString`; `profitLoss`: `ZodOptional`\<`ZodString`\>; `type`: `ZodEnum`\<\{ `BUY`: `"BUY"`; `SELL`: `"SELL"`; \}\>; `userId`: `ZodString`; \}, `$strip`\>

Defined in: [packages/application/src/dtos/transaction.req.dto.ts:30](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/application/src/dtos/transaction.req.dto.ts#L30)

Schema describing the payload required to create a transaction from the API.
