[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / parseCreateTransactionRequest

# Variable: parseCreateTransactionRequest()

> `const` **parseCreateTransactionRequest**: (`input`) => `Result`\<\{ `amount`: `string`; `currency`: `string`; `datetime`: `Date`; `fee?`: `string`; `feeCurrency?`: `string`; `price`: `string`; `profitLoss?`: `string`; `type`: `"BUY"` \| `"SELL"`; `userId`: `string`; \}, `Error`\>

Defined in: [packages/application/src/dtos/transaction.req.dto.ts:110](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/application/src/dtos/transaction.req.dto.ts#L110)

Parse and validate an unknown payload into [CreateTransactionRequest](../type-aliases/CreateTransactionRequest.md).
Wraps parseWith to return a `Result` with typed error metadata.

## Parameters

### input

`unknown`

## Returns

`Result`\<\{ `amount`: `string`; `currency`: `string`; `datetime`: `Date`; `fee?`: `string`; `feeCurrency?`: `string`; `price`: `string`; `profitLoss?`: `string`; `type`: `"BUY"` \| `"SELL"`; `userId`: `string`; \}, `Error`\>
