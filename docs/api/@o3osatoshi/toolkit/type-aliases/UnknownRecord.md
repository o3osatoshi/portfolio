[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / UnknownRecord

# Type Alias: UnknownRecord

> **UnknownRecord** = `Record`\<`string`, `unknown`\>

Defined in: [packages/toolkit/src/types.ts:101](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/types.ts#L101)

Generic object-shaped JSON-compatible record.

## Remarks

- Narrows the built-in `Object` type to a simple `Record<string, unknown>`.
- Prefer supplying a more specific type parameter where your value has a known shape.
