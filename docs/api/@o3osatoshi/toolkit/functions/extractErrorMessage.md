[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / extractErrorMessage

# Function: extractErrorMessage()

> **extractErrorMessage**(`cause`): `string` \| `undefined`

Defined in: [packages/toolkit/src/error/error-attributes.ts:39](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-attributes.ts#L39)

Extracts a concise error message string from an unknown cause when possible.

The function prefers `Error` instances but gracefully handles plain strings and
objects that expose a `message` field.

## Parameters

### cause

`unknown`

Value supplied as an error `cause`.

## Returns

`string` \| `undefined`

A message string when detectable, otherwise `undefined`.
