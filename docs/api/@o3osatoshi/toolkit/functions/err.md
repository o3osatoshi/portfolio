[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / err

# Function: err()

> **err**(`error`): [`ActionState`](../type-aliases/ActionState.md)\<`never`, [`SerializedRichError`](../type-aliases/SerializedRichError.md)\>

Defined in: [packages/toolkit/src/next/action-state.ts:50](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/next/action-state.ts#L50)

Build a failure [ActionState](../type-aliases/ActionState.md).

## Parameters

### error

[`RichError`](../classes/RichError.md)

Structured error that should already be handled as [RichError](../classes/RichError.md).

## Returns

[`ActionState`](../type-aliases/ActionState.md)\<`never`, [`SerializedRichError`](../type-aliases/SerializedRichError.md)\>

An [ActionState](../type-aliases/ActionState.md) with `ok: false` and serialized RichError metadata.

## Remarks

- Errors are always serialized via [serializeRichError](serializeRichError.md).
- Cause chains are omitted from action payloads to avoid leaking internal details.
- Stack traces are omitted for server action payload safety.
