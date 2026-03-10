[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / isDeserializableResponse

# Function: isDeserializableResponse()

> **isDeserializableResponse**(`response`): `boolean`

Defined in: [packages/toolkit/src/http/response-deserializer.ts:29](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-deserializer.ts#L29)

Determine whether a response is likely to contain a JSON body.

Uses status codes, `content-length`, and `content-type` to avoid
JSON parsing on empty/non-JSON responses.

## Parameters

### response

`Response`

Fetch response to inspect.

## Returns

`boolean`

`true` when it is reasonable to attempt JSON deserialization.
