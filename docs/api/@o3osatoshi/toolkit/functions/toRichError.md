[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / toRichError

# Function: toRichError()

> **toRichError**(`error`, `fallback`): [`RichError`](../classes/RichError.md)

Defined in: [packages/toolkit/src/error/error.ts:169](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L169)

Normalize an unknown value into a [RichError](../classes/RichError.md).

## Parameters

### error

`unknown`

### fallback

`Partial`\<[`NewRichError`](../type-aliases/NewRichError.md)\> = `{}`

## Returns

[`RichError`](../classes/RichError.md)

## Remarks

- Returns the input as-is when it is already a [RichError](../classes/RichError.md).
- Fills missing `details.reason` from the source error message when possible.
- Adds normalization metadata (`normalizedBy`, `normalizedFromType`,
  `normalizedFromName`) while preserving caller-provided `fallback.meta`.
