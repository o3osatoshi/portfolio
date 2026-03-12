[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / omitUndefined

# Function: omitUndefined()

> **omitUndefined**\<`T`\>(`input`): [`OmitUndefinedDeep`](../type-aliases/OmitUndefinedDeep.md)\<`T`\>

Defined in: [packages/toolkit/src/omit-undefined.ts:55](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/omit-undefined.ts#L55)

Returns a copy of `input` with keys whose value is `undefined` removed.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### input

`T`

## Returns

[`OmitUndefinedDeep`](../type-aliases/OmitUndefinedDeep.md)\<`T`\>

## Remarks

- Recursively processes only plain objects (`Object.prototype` or `null` prototype).
- Arrays and non-plain objects (Date, Map, Set, functions, class instances) are preserved as-is.
- `null`, `0`, `false`, and empty strings are preserved.
