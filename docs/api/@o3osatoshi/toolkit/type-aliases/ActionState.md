[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / ActionState

# Type Alias: ActionState\<T, E\>

> **ActionState**\<`T`, `E`\> = \{ `data`: `T`; `ok`: `true`; \} \| \{ `error`: `E`; `ok`: `false`; \} \| `never`

Defined in: [next/action-state.ts:40](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/next/action-state.ts#L40)

Success/failure envelope compatible with React `useActionState`.

## Type Parameters

### T

`T` *extends* [`ActionData`](ActionData.md) = [`UnknownRecord`](UnknownRecord.md)

Type of the `data` field; should usually be an [ActionData](ActionData.md) union.

### E

`E` *extends* [`ActionError`](ActionError.md) = [`ActionError`](ActionError.md)

Error payload type; defaults to [ActionError](ActionError.md).

## Remarks

- The success shape is `{ ok: true, data }`.
- The failure shape is `{ ok: false, error }`.
- In some generic compositions this type can collapse to `never` to represent an impossible branch; at runtime you only handle the success and failure shapes.
