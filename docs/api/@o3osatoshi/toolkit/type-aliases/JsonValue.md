[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / JsonValue

# Type Alias: JsonValue

> **JsonValue** = [`JsonArray`](JsonArray.md) \| [`JsonObject`](JsonObject.md) \| [`JsonPrimitive`](JsonPrimitive.md)

Defined in: [types.ts:37](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/types.ts#L37)

JSON value as defined by the JSON specification.

## Remarks

- Can be a primitive, array, or object.
- Nested values are also constrained to JsonValue.
