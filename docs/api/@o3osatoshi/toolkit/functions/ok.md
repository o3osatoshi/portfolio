[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / ok

# Function: ok()

> **ok**\<`T`\>(`data`): [`ActionState`](../type-aliases/ActionState.md)\<`T`, `never`\>

Defined in: [next/action-state.ts:76](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/next/action-state.ts#L76)

Build a success [ActionState](../type-aliases/ActionState.md).

## Type Parameters

### T

`T` *extends* [`ActionData`](../type-aliases/ActionData.md)\<[`UnknownRecord`](../type-aliases/UnknownRecord.md)\>

## Parameters

### data

`T`

Arbitrary payload you want to return to the caller.

## Returns

[`ActionState`](../type-aliases/ActionState.md)\<`T`, `never`\>

An [ActionState](../type-aliases/ActionState.md) with `ok: true` and the supplied data. The returned type uses `E = never` so that the failure branch is impossible when you construct the state via this helper.
