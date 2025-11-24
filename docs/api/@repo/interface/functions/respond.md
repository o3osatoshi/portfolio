[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / respond

# Function: respond()

> **respond**\<`T`\>(`c`): (`ra`) => `JSONRespondReturn`\<`SerializedError`, `ErrorStatusCode`\> \| `JSONRespondReturn`\<`T`, [`SuccessStatusCode`](../type-aliases/SuccessStatusCode.md)\>

Defined in: [packages/interface/src/http/core/respond.ts:13](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/interface/src/http/core/respond.ts#L13)

## Type Parameters

### T

`T`

## Parameters

### c

`Context`

## Returns

> (`ra`): `JSONRespondReturn`\<`SerializedError`, `ErrorStatusCode`\> \| `JSONRespondReturn`\<`T`, [`SuccessStatusCode`](../type-aliases/SuccessStatusCode.md)\>

### Parameters

#### ra

`Result`\<`T`, `Error`\>

### Returns

`JSONRespondReturn`\<`SerializedError`, `ErrorStatusCode`\> \| `JSONRespondReturn`\<`T`, [`SuccessStatusCode`](../type-aliases/SuccessStatusCode.md)\>
