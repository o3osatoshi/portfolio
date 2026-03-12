[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / serialize

# Function: serialize()

> **serialize**(`value`, `options`): `Result`\<`string`, [`RichError`](../classes/RichError.md)\>

Defined in: [packages/toolkit/src/json-codec.ts:106](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/json-codec.ts#L106)

Serializes a value to JSON.

## Parameters

### value

`unknown`

Arbitrary value to serialize.

### options

[`JsonSerializeOptions`](../type-aliases/JsonSerializeOptions.md) = `{}`

Optional `JSON.stringify` settings such as `replacer` and `space`.

## Returns

`Result`\<`string`, [`RichError`](../classes/RichError.md)\>

A neverthrow result containing the JSON string on success, or a structured error on failure.

## Remarks

This wraps `JSON.stringify` in a neverthrow `Result`.

Serialization fails when:
- `JSON.stringify` throws (for example, because of cyclic references)
- `JSON.stringify` returns `undefined` instead of a string

## Example

```ts
const result = serialize({ count: 1 }, { space: 2 });
```
