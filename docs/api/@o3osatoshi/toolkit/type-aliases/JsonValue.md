[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / JsonValue

# Type Alias: JsonValue

> **JsonValue** = [`JsonArray`](JsonArray.md) \| [`JsonObject`](JsonObject.md) \| [`JsonPrimitive`](JsonPrimitive.md)

Defined in: [packages/toolkit/src/types.ts:50](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/types.ts#L50)

JSON value as defined by the JSON specification.

## Remarks

- Can be a primitive, array, or object.
- Nested values are also constrained to JsonValue.
