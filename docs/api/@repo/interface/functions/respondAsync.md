[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / respondAsync

# Function: respondAsync()

> **respondAsync**\<`T`\>(`c`): (`ra`) => `Promise`\<`JSONRespondReturn`\<`SerializedError`, `ErrorStatusCode`\> \| `JSONRespondReturn`\<`T`, [`SuccessStatusCode`](../type-aliases/SuccessStatusCode.md)\>\>

Defined in: [packages/interface/src/http/core/respond.ts:36](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/http/core/respond.ts#L36)

Railway-style responder: map a `ResultAsync` into a JSON HTTP response.

- Success → returns a 200 JSON response with the value.
- Failure → converts the error via toHttpErrorResponse and returns
  a normalized JSON error with an appropriate status code.

## Type Parameters

### T

`T`

## Parameters

### c

`Context`

## Returns

A function that accepts a `ResultAsync<T, Error>` and yields a
`Promise<Response>` suitable for Hono route handlers.

> (`ra`): `Promise`\<`JSONRespondReturn`\<`SerializedError`, `ErrorStatusCode`\> \| `JSONRespondReturn`\<`T`, [`SuccessStatusCode`](../type-aliases/SuccessStatusCode.md)\>\>

### Parameters

#### ra

`ResultAsync`\<`T`, `Error`\>

### Returns

`Promise`\<`JSONRespondReturn`\<`SerializedError`, `ErrorStatusCode`\> \| `JSONRespondReturn`\<`T`, [`SuccessStatusCode`](../type-aliases/SuccessStatusCode.md)\>\>
