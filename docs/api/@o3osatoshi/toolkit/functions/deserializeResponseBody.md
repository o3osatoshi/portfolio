[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / deserializeResponseBody

# Function: deserializeResponseBody()

> **deserializeResponseBody**(`response`): `Promise`\<`unknown`\>

Defined in: [packages/toolkit/src/http/response-deserializer.ts:10](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-deserializer.ts#L10)

Deserialize a JSON response body when one is present.

Returns `null` when the response is empty or not JSON.

## Parameters

### response

`Response`

Fetch response to inspect and parse.

## Returns

`Promise`\<`unknown`\>

Parsed JSON payload, or `null` when no JSON body is present.
