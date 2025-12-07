[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / err

# Function: err()

> **err**\<`E`\>(`error`): [`ActionState`](../type-aliases/ActionState.md)

Defined in: [next/action-state.ts:55](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/next/action-state.ts#L55)

Build a failure [ActionState](../type-aliases/ActionState.md) with a user-facing error message.

## Type Parameters

### E

`E` *extends* `Error`

## Parameters

### error

A string, Error, or pre-shaped [ActionError](../type-aliases/ActionError.md).

`string` | [`ActionError`](../type-aliases/ActionError.md) | `E`

## Returns

[`ActionState`](../type-aliases/ActionState.md)

An [ActionState](../type-aliases/ActionState.md) with `ok: false` and a friendly message derived from the error.

## Remarks

- Strings and pre-shaped [ActionError](../type-aliases/ActionError.md) values are passed through.
- Native `Error` instances are converted via [userMessageFromError](userMessageFromError.md) and wrapped as [ActionError](../type-aliases/ActionError.md) to keep messages user-friendly and serializable.
