[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / extractErrorName

# Function: extractErrorName()

> **extractErrorName**(`cause`): `string` \| `undefined`

Defined in: [packages/toolkit/src/error/error-attributes.ts:63](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-attributes.ts#L63)

Extracts an error name from an unknown cause when possible.

This helper mirrors `extractErrorMessage` but targets the `name` field. It is useful for
detecting coarse error categories (e.g. `AbortError`) even when the error instance is wrapped
or proxied.

## Parameters

### cause

`unknown`

Value supplied as an error `cause`.

## Returns

`string` \| `undefined`

Detected error name or `undefined` when the value lacks an appropriate field.
