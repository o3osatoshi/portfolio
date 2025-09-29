[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / parseCreateTransactionRequest

# Variable: parseCreateTransactionRequest()

> `const` **parseCreateTransactionRequest**: (`input`) => `Result`\<\{ `amount`: `string`; `currency`: `string`; `datetime`: `Date`; `fee?`: `string`; `feeCurrency?`: `string`; `price`: `string`; `profitLoss?`: `string`; `type`: `"BUY"` \| `"SELL"`; `userId`: `string`; \}, `Error`\>

Defined in: [packages/application/src/dtos/transaction.req.dto.ts:110](https://github.com/o3osatoshi/experiment/blob/04dfa58df6e48824a200a24d77afef7ce464e1ae/packages/application/src/dtos/transaction.req.dto.ts#L110)

Parse and validate an unknown payload into [CreateTransactionRequest](../type-aliases/CreateTransactionRequest.md).
Wraps parseWith to return a `Result` with typed error metadata.

## Parameters

### input

`unknown`

## Returns

`Result`\<\{ `amount`: `string`; `currency`: `string`; `datetime`: `Date`; `fee?`: `string`; `feeCurrency?`: `string`; `price`: `string`; `profitLoss?`: `string`; `type`: `"BUY"` \| `"SELL"`; `userId`: `string`; \}, `Error`\>
