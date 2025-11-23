[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / extractErrorMessage

# Function: extractErrorMessage()

> **extractErrorMessage**(`cause`): `undefined` \| `string`

Defined in: [error/error-attributes.ts:11](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/error/error-attributes.ts#L11)

Extracts a concise error message string from an unknown cause when possible.

The function prefers `Error` instances but gracefully handles plain strings and
objects that expose a `message` field.

## Parameters

### cause

`unknown`

Value supplied as an error `cause`.

## Returns

`undefined` \| `string`

A message string when detectable, otherwise `undefined`.
