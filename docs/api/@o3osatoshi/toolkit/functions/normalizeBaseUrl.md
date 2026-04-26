[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / normalizeBaseUrl

# Function: normalizeBaseUrl()

> **normalizeBaseUrl**(`baseUrl`): `string`

Defined in: [packages/toolkit/src/http/http-utils.ts:189](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L189)

Ensure a base URL ends with a trailing slash, which makes URL resolution
with [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) predictable.

## Parameters

### baseUrl

`string`

Base URL to normalize.

## Returns

`string`

The normalized base URL with a trailing slash.
