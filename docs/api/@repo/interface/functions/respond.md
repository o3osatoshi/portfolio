[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / respond

# Function: respond()

> **respond**\<`T`\>(`c`): (`ra`) => `JSONRespondReturn`\<`SerializedError`, `ErrorStatusCode`\> \| `JSONRespondReturn`\<`T`, [`SuccessStatusCode`](../type-aliases/SuccessStatusCode.md)\>

Defined in: [packages/interface/src/http/core/respond.ts:13](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/http/core/respond.ts#L13)

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
