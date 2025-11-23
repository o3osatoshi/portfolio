[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / Object

# Type Alias: Object

> **Object** = `Record`\<`string`, `unknown`\>

Defined in: [next/action-state.ts:49](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/next/action-state.ts#L49)

Default object-shaped payload used by [ActionData](ActionData.md) and [ActionState](ActionState.md).

## Remarks

- This narrows the built-in `Object` type to a simple `Record<string, unknown>`.
- Prefer supplying a more specific type parameter where your action has a known shape.
