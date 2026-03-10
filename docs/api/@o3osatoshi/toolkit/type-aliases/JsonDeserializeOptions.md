[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / JsonDeserializeOptions

# Type Alias: JsonDeserializeOptions

> **JsonDeserializeOptions** = `object`

Defined in: [packages/toolkit/src/json-codec.ts:14](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/json-codec.ts#L14)

Options for [deserialize](../functions/deserialize.md).

## Remarks

Passed through to `JSON.parse`.

## Properties

### reviver?

> `optional` **reviver**: `Parameters`\<*typeof* `JSON.parse`\>\[`1`\]

Defined in: [packages/toolkit/src/json-codec.ts:18](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/json-codec.ts#L18)

Optional reviver invoked for each parsed property during `JSON.parse`.
