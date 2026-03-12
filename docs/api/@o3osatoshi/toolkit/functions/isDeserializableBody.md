[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / isDeserializableBody

# Function: isDeserializableBody()

> **isDeserializableBody**(`res`): `boolean`

Defined in: [packages/toolkit/src/http/http-utils.ts:162](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L162)

Heuristic to detect whether a response body should be deserialized.

Rules:
- 204, 205, and 304 responses are considered empty.
- content-length: 0 is considered empty.
- A missing content-type header is considered empty.

Note: this does not validate or parse content types.

## Parameters

### res

`Response`

Fetch response to inspect.

## Returns

`boolean`

`true` when a body is likely present.
