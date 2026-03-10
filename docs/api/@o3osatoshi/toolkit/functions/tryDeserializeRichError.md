[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / tryDeserializeRichError

# Function: tryDeserializeRichError()

> **tryDeserializeRichError**(`input`): `Result`\<[`RichError`](../classes/RichError.md), [`DeserializeRichErrorFailure`](../type-aliases/DeserializeRichErrorFailure.md)\>

Defined in: [packages/toolkit/src/error/error-serializer.ts:225](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L225)

Strictly deserialize a serialized RichError payload.

## Parameters

### input

`unknown`

## Returns

`Result`\<[`RichError`](../classes/RichError.md), [`DeserializeRichErrorFailure`](../type-aliases/DeserializeRichErrorFailure.md)\>

## Remarks

- Accepts only payloads that satisfy [serializedRichErrorSchema](../variables/serializedRichErrorSchema.md).
- Returns `Err` when the payload is invalid or does not represent a RichError.
- Use [deserializeRichError](deserializeRichError.md) when you always need a `RichError` return value.
