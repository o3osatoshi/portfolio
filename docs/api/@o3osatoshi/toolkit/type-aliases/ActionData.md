[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / ActionData

# Type Alias: ActionData\<T\>

> **ActionData**\<`T`\> = `null` \| `T` \| `undefined`

Defined in: [next/action-state.ts:13](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/next/action-state.ts#L13)

Data payload accepted by [ActionState](ActionState.md). Matches the shape that React
`useActionState` prefers for server actions.

## Type Parameters

### T

`T` *extends* [`Object`](Object.md) = [`Object`](Object.md)

Base (non-null) data payload type; defaults to [Object](Object.md).

## Remarks

- The full payload type is a union of `T | null | undefined`.
- `null` / `undefined` can be used to represent "no result yet" or an intentionally empty payload.
