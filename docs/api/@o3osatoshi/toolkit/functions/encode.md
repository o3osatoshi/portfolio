[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / encode

# Function: encode()

> **encode**(`value`): `Result`\<`string`, `Error`\>

Defined in: [json-codec.ts:48](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/json-codec.ts#L48)

Serializes a value to JSON, returning a neverthrow result.

When `JSON.stringify` succeeds, this returns an `ok` result containing
the encoded JSON string. If serialization throws (for example, because
of cyclic references), this returns a `"Serialization"` error from the
`"Infra"` layer.

## Parameters

### value

`unknown`

Arbitrary value to serialize.

## Returns

`Result`\<`string`, `Error`\>

A neverthrow result containing the JSON string on success, or a structured error on failure.
