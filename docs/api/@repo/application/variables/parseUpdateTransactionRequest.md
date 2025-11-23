[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / parseUpdateTransactionRequest

# Variable: parseUpdateTransactionRequest()

> `const` **parseUpdateTransactionRequest**: (`input`) => `Result`\<\{ `amount?`: `string`; `currency?`: `string`; `datetime?`: `Date`; `fee?`: `string`; `feeCurrency?`: `string`; `id`: `string`; `price?`: `string`; `profitLoss?`: `string`; `type?`: `"BUY"` \| `"SELL"`; \}, `Error`\>

Defined in: [packages/application/src/dtos/transaction.req.dto.ts:119](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/application/src/dtos/transaction.req.dto.ts#L119)

Parse and validate an unknown payload into [UpdateTransactionRequest](../type-aliases/UpdateTransactionRequest.md).

## Parameters

### input

`unknown`

## Returns

`Result`\<\{ `amount?`: `string`; `currency?`: `string`; `datetime?`: `Date`; `fee?`: `string`; `feeCurrency?`: `string`; `id`: `string`; `price?`: `string`; `profitLoss?`: `string`; `type?`: `"BUY"` \| `"SELL"`; \}, `Error`\>
