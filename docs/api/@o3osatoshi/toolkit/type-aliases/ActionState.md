[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / ActionState

# Type Alias: ActionState\<T, E\>

> **ActionState**\<`T`, `E`\> = \{ `data`: `T`; `ok`: `true`; \} \| \{ `error`: `E`; `ok`: `false`; \} \| `never`

Defined in: [next/action-state.ts:36](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/next/action-state.ts#L36)

Success/failure envelope compatible with React `useActionState`.

## Type Parameters

### T

`T` *extends* [`ActionData`](ActionData.md) = [`Object`](Object.md)

Data payload type; defaults to [Object](Object.md).

### E

`E` *extends* [`ActionError`](ActionError.md) = [`ActionError`](ActionError.md)

Error payload type; defaults to [ActionError](ActionError.md).

## Remarks

- The success shape is `{ ok: true, data }`.
- The failure shape is `{ ok: false, error }`.
- In some generic compositions this type can collapse to `never` to represent an impossible branch; at runtime you only handle the success and failure shapes.
