[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / serializeError

# Function: serializeError()

> **serializeError**(`error`, `opts`): [`SerializedError`](../interfaces/SerializedError.md)

Defined in: [error/error-serializer.ts:138](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/error/error-serializer.ts#L138)

Convert an `Error` into a [SerializedError](../interfaces/SerializedError.md).

Behavior:
- Preserves `name` and `message`.
- Optionally includes `stack` (dev-only by default).
- Serializes nested `cause` recursively up to `depth`.

## Parameters

### error

`Error`

Error instance to serialize.

### opts

[`SerializeOptions`](../type-aliases/SerializeOptions.md) = `{}`

Serialization options (depth, stack inclusion, truncation).

## Returns

[`SerializedError`](../interfaces/SerializedError.md)

A JSON-friendly error object suitable for transport or storage.

## Example

```ts
const s = serializeError(err); // send to worker or log store
const e = deserializeError(s); // rehydrate in another process

@public
```
