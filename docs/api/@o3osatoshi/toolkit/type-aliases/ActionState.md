[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / ActionState

# Type Alias: ActionState\<T, E\>

> **ActionState**\<`T`, `E`\> = \{ `data`: `T`; `ok`: `true`; \} \| \{ `error`: `E`; `ok`: `false`; \} \| `never`

Defined in: [packages/toolkit/src/next/action-state.ts:34](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/next/action-state.ts#L34)

Success/failure envelope compatible with React `useActionState`.

## Type Parameters

### T

`T` *extends* [`ActionData`](ActionData.md) = [`UnknownRecord`](UnknownRecord.md)

Type of the `data` field; should usually be an [ActionData](ActionData.md) union.

### E

`E` *extends* [`SerializedRichError`](SerializedRichError.md) = [`SerializedRichError`](SerializedRichError.md)

Error payload type; defaults to [SerializedRichError](SerializedRichError.md).

## Remarks

- The success shape is `{ ok: true, data }`.
- The failure shape is `{ ok: false, error }`.
- In some generic compositions this type can collapse to `never` to represent an impossible branch; at runtime you only handle the success and failure shapes.
