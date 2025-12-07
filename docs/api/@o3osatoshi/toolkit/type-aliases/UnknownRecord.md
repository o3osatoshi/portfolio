[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / UnknownRecord

# Type Alias: UnknownRecord

> **UnknownRecord** = `Record`\<`string`, `unknown`\>

Defined in: [types.ts:47](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/types.ts#L47)

Generic object-shaped JSON-compatible record.

## Remarks

- Narrows the built-in `Object` type to a simple `Record<string, unknown>`.
- Prefer supplying a more specific type parameter where your value has a known shape.
