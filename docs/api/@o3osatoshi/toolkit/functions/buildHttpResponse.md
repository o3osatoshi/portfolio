[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / buildHttpResponse

# Function: buildHttpResponse()

> **buildHttpResponse**\<`T`\>(`data`, `response`, `options`): [`HttpResponse`](../type-aliases/HttpResponse.md)\<`T`\>

Defined in: [packages/toolkit/src/http/response-builder.ts:24](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-builder.ts#L24)

Build a normalized [HttpResponse](../type-aliases/HttpResponse.md) from a parsed body and Fetch response.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### data

`T`

Parsed response body payload.

### response

`Response`

Fetch response metadata.

### options

[`BuildHttpResponseOptions`](../type-aliases/BuildHttpResponseOptions.md) = `{}`

Optional cache/retry metadata.

## Returns

[`HttpResponse`](../type-aliases/HttpResponse.md)\<`T`\>

Normalized response payload.
