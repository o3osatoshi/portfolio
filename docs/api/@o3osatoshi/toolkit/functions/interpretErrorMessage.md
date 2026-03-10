[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / interpretErrorMessage

# Function: interpretErrorMessage()

> **interpretErrorMessage**(`error`, `__namedParameters`): `string`

Defined in: [packages/toolkit/src/error/error-message.ts:45](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-message.ts#L45)

Resolve a user-facing message from RichError i18n metadata.

Resolution order:
1. `error.i18n`
2. `fallback.i18n`
3. `fallback.message`
4. `"Unknown error"`

## Parameters

### error

[`RichError`](../classes/RichError.md) | [`SerializedRichError`](../type-aliases/SerializedRichError.md)

### \_\_namedParameters

[`InterpretErrorMessageOptions`](../type-aliases/InterpretErrorMessageOptions.md)

## Returns

`string`
