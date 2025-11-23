[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / ok

# Function: ok()

> **ok**\<`T`\>(`data`): [`ActionState`](../type-aliases/ActionState.md)\<`T`, `never`\>

Defined in: [next/action-state.ts:82](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/next/action-state.ts#L82)

Build a success [ActionState](../type-aliases/ActionState.md).

## Type Parameters

### T

`T` *extends* [`ActionData`](../type-aliases/ActionData.md)\<[`Object`](../type-aliases/Object.md)\>

## Parameters

### data

`T`

Arbitrary payload you want to return to the caller.

## Returns

[`ActionState`](../type-aliases/ActionState.md)\<`T`, `never`\>

An [ActionState](../type-aliases/ActionState.md) with `ok: true` and the supplied data.
