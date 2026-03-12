[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / coerceErrorMessage

# Function: coerceErrorMessage()

> **coerceErrorMessage**(`cause`): `string` \| `undefined`

Defined in: [packages/toolkit/src/error/error-attributes.ts:14](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-attributes.ts#L14)

Coerces an unknown value into a best-effort error message.

## Parameters

### cause

`unknown`

Value supplied as an error `cause`.

## Returns

`string` \| `undefined`

A message string (possibly empty) when derivable, otherwise `undefined`.

## Remarks

Uses [extractErrorMessage](extractErrorMessage.md) when available, otherwise falls back to
JSON serialization or string coercion to avoid missing messages.
