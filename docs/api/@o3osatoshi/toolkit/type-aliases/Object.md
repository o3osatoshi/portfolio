[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / Object

# Type Alias: Object

> **Object** = `Record`\<`string`, `unknown`\>

Defined in: [next/action-state.ts:49](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/next/action-state.ts#L49)

Default object-shaped payload used by [ActionData](ActionData.md) and [ActionState](ActionState.md).

## Remarks

- This narrows the built-in `Object` type to a simple `Record<string, unknown>`.
- Prefer supplying a more specific type parameter where your action has a known shape.
