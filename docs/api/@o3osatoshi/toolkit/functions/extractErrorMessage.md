[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / extractErrorMessage

# Function: extractErrorMessage()

> **extractErrorMessage**(`cause`): `string` \| `undefined`

Defined in: [error/error-attributes.ts:11](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error-attributes.ts#L11)

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
