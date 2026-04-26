[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / newFetchError

# Function: newFetchError()

> **newFetchError**(`__namedParameters`): [`RichError`](../classes/RichError.md)

Defined in: [packages/toolkit/src/http/fetch-error.ts:73](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/fetch-error.ts#L73)

Builds an Error describing a failed fetch request using a consistent toolkit shape.

Classification rules:
- Aborted/timeout signals map to `Timeout`.
- Network-level failures (DNS, connection refused, etc.) map to `Unavailable`.
- Other situations fall back to `Internal`.

The resulting `Error` is tagged with `layer: "External"` and a descriptive message that includes
the HTTP method/URL when available.
Providing `kind` allows overriding the inferred classification when callers have stronger context.

## Parameters

### \_\_namedParameters

[`NewFetchError`](../type-aliases/NewFetchError.md)

## Returns

[`RichError`](../classes/RichError.md)
