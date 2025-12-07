[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / ActionData

# Type Alias: ActionData\<TBase\>

> **ActionData**\<`TBase`\> = `null` \| `TBase` \| `undefined`

Defined in: [next/action-state.ts:14](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/next/action-state.ts#L14)

Data payload accepted by [ActionState](ActionState.md). Designed to mirror the
"state" slot used by React `useActionState` for server actions.

## Type Parameters

### TBase

`TBase` *extends* [`UnknownRecord`](UnknownRecord.md) = [`UnknownRecord`](UnknownRecord.md)

Base (non-null) data payload type; defaults to [UnknownRecord](UnknownRecord.md).

## Remarks

- The full payload type is a union of `TBase | null | undefined`.
- `null` / `undefined` can be used to represent "no result yet" or an intentionally empty payload.
