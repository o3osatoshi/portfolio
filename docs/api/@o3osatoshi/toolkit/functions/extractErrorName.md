[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / extractErrorName

# Function: extractErrorName()

> **extractErrorName**(`cause`): `string` \| `undefined`

Defined in: [error/error-attributes.ts:35](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error-attributes.ts#L35)

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
