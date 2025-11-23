[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / userMessageFromError

# Function: userMessageFromError()

> **userMessageFromError**(`error`): `string`

Defined in: [next/error-message.ts:48](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/next/error-message.ts#L48)

Derive a user-facing message from an `Error` produced by `@o3osatoshi/toolkit`.

## Parameters

### error

`Error`

An Error, ideally created via `newError`.

## Returns

`string`

A concise, user-friendly message.

## Remarks

Ordering rules:
- If the error `name` yields a `kind`, return the mapped friendly text.
- Append parsed `reason` / `impact` / `hint` when present in `composeErrorMessage` JSON.
- If no kind is detected but structured message fields exist, join them.
- Otherwise use the raw `error.message` when it is not JSON-like; fall back to a stable generic string.
