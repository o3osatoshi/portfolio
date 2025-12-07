[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / decode

# Function: decode()

> **decode**(`value`): `Result`\<[`JsonContainer`](../type-aliases/JsonContainer.md), `Error`\>

Defined in: [json-codec.ts:18](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/json-codec.ts#L18)

Parses a JSON string into a [JsonContainer](../type-aliases/JsonContainer.md), returning a neverthrow result.

The input must represent a top-level JSON object (`{}`) or array (`[]`).
If parsing fails or the decoded value is a JSON primitive
(`string`, `number`, `boolean`, or `null`), this returns an error of kind
`"Serialization"` from the `"Infra"` layer.

## Parameters

### value

`string`

JSON string to parse.

## Returns

`Result`\<[`JsonContainer`](../type-aliases/JsonContainer.md), `Error`\>

A neverthrow result containing a [JsonContainer](../type-aliases/JsonContainer.md) on success, or a structured error on failure.
