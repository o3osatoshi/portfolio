[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / newFetchError

# Function: newFetchError()

> **newFetchError**(`__namedParameters`): `Error`

Defined in: [http/fetch-error.ts:71](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/http/fetch-error.ts#L71)

Builds an Error describing a failed fetch request using a consistent toolkit shape.

Classification rules:
- Aborted/timeout signals map to `Timeout`.
- Network-level failures (DNS, connection refused, etc.) map to `Unavailable`.
- Unknown situations fall back to `Unknown`.

The resulting `Error` is tagged with `layer: "External"` and a descriptive message that includes
the HTTP method/URL when available.
Providing `kind` allows overriding the inferred classification when callers have stronger context.

## Parameters

### \_\_namedParameters

[`NewFetchError`](../type-aliases/NewFetchError.md)

## Returns

`Error`
