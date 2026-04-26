[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / deserialize

# Function: deserialize()

> **deserialize**(`value`, `options`): `Result`\<[`JsonContainer`](../type-aliases/JsonContainer.md), [`RichError`](../classes/RichError.md)\>

Defined in: [packages/toolkit/src/json-codec.ts:62](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/json-codec.ts#L62)

Parses a JSON string into a top-level JSON object or array.

## Parameters

### value

`string`

JSON string to parse.

### options

[`JsonDeserializeOptions`](../type-aliases/JsonDeserializeOptions.md) = `{}`

Optional `JSON.parse` settings such as `reviver`.

## Returns

`Result`\<[`JsonContainer`](../type-aliases/JsonContainer.md), [`RichError`](../classes/RichError.md)\>

A neverthrow result containing a [JsonContainer](../type-aliases/JsonContainer.md) on success, or a structured error on failure.

## Remarks

This is stricter than bare `JSON.parse`:
- parsing must succeed
- the top-level decoded value must be an object (`{}`) or array (`[]`)

Primitive JSON values such as `"hello"`, `123`, `true`, or `null` are
rejected and returned as a `Serialization` [RichError](../classes/RichError.md).

## Example

```ts
const result = deserialize('{"count":"1"}', {
  reviver: (key, value) => (key === "count" ? Number(value) : value),
});
```
