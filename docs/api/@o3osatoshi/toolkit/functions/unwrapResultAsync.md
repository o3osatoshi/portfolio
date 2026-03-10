[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / unwrapResultAsync

# Function: unwrapResultAsync()

> **unwrapResultAsync**\<`T`, `E`\>(`result`): `Promise`\<`T`\>

Defined in: [packages/toolkit/src/result.ts:22](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/result.ts#L22)

Unwrap a ResultAsync into a Promise that throws on Err.

## Type Parameters

### T

`T`

Successful value type inside `ResultAsync`.

### E

`E` *extends* [`RichError`](../classes/RichError.md) = [`RichError`](../classes/RichError.md)

Error type extending [RichError](../classes/RichError.md). Defaults to `RichError`.

## Parameters

### result

`ResultAsync`\<`T`, `E`\>

ResultAsync value to unwrap.

## Returns

`Promise`\<`T`\>

A Promise that resolves with the Ok value or rejects with the Err error.

## Remarks

This helper is intentionally discouraged. It bypasses the ResultAsync flow and
reintroduces thrown exceptions, which makes error handling less explicit and
can leak failures across boundaries. Prefer `match`, `mapErr`, or returning
`ResultAsync` whenever possible. Use only at integration boundaries that
require a Promise that rejects (for example, scheduler step runners).
