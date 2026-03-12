[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / JsonSerializeOptions

# Type Alias: JsonSerializeOptions

> **JsonSerializeOptions** = `object`

Defined in: [packages/toolkit/src/json-codec.ts:29](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/json-codec.ts#L29)

Options for [serialize](../functions/serialize.md).

## Remarks

Passed through to `JSON.stringify`.

## Properties

### replacer?

> `optional` **replacer**: `Parameters`\<*typeof* `JSON.stringify`\>\[`1`\]

Defined in: [packages/toolkit/src/json-codec.ts:33](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/json-codec.ts#L33)

Optional replacer used to filter or transform values during serialization.

***

### space?

> `optional` **space**: `Parameters`\<*typeof* `JSON.stringify`\>\[`2`\]

Defined in: [packages/toolkit/src/json-codec.ts:37](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/json-codec.ts#L37)

Optional indentation passed to `JSON.stringify` for pretty-printed output.
