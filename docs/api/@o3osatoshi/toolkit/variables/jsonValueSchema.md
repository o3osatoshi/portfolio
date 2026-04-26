[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / jsonValueSchema

# Variable: jsonValueSchema

> `const` **jsonValueSchema**: `z.ZodType`\<[`JsonValue`](../type-aliases/JsonValue.md)\>

Defined in: [packages/toolkit/src/types.ts:72](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/types.ts#L72)

Zod schema for [JsonValue](../type-aliases/JsonValue.md).

## Remarks

Uses `z.lazy` to support recursive object/array nesting.
