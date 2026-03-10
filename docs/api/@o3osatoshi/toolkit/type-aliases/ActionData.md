[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / ActionData

# Type Alias: ActionData\<TBase\>

> **ActionData**\<`TBase`\> = `null` \| `TBase` \| `undefined`

Defined in: [packages/toolkit/src/next/action-state.ts:18](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/next/action-state.ts#L18)

Data payload accepted by [ActionState](ActionState.md). Designed to mirror the
"state" slot used by React `useActionState` for server actions.

## Type Parameters

### TBase

`TBase` *extends* [`UnknownRecord`](UnknownRecord.md) = [`UnknownRecord`](UnknownRecord.md)

Base (non-null) data payload type; defaults to [UnknownRecord](UnknownRecord.md).

## Remarks

- The full payload type is a union of `TBase | null | undefined`.
- `null` / `undefined` can be used to represent "no result yet" or an intentionally empty payload.
