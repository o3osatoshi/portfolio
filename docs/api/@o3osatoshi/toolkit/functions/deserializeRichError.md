[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / deserializeRichError

# Function: deserializeRichError()

> **deserializeRichError**(`input`, `options`): [`RichError`](../classes/RichError.md)

Defined in: [packages/toolkit/src/error/error-serializer.ts:113](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L113)

Deserialize a payload into [RichError](../classes/RichError.md).

## Parameters

### input

`unknown`

### options

[`DeserializeRichErrorOptions`](../type-aliases/DeserializeRichErrorOptions.md) = `{}`

## Returns

[`RichError`](../classes/RichError.md)

## Remarks

Uses [tryDeserializeRichError](tryDeserializeRichError.md) internally. When strict deserialization
fails, this returns a structured `Serialization` RichError describing the
deserialization failure.
