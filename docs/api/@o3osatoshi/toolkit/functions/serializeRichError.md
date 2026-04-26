[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / serializeRichError

# Function: serializeRichError()

> **serializeRichError**(`error`, `opts`): [`SerializedRichError`](../type-aliases/SerializedRichError.md)

Defined in: [packages/toolkit/src/error/error-serializer.ts:187](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L187)

Convert a [RichError](../classes/RichError.md) into a JSON-safe transport payload.

Behavior:
- Preserves `name` and `message`.
- Can omit `cause` entirely when `includeCause` is `false`.
- Optionally includes `stack` (dev-only by default).
- Serializes nested `cause` recursively up to `depth`.

## Parameters

### error

[`RichError`](../classes/RichError.md)

RichError instance to serialize.

### opts

[`SerializeOptions`](../type-aliases/SerializeOptions.md) = `{}`

Serialization options (depth, stack inclusion).

## Returns

[`SerializedRichError`](../type-aliases/SerializedRichError.md)

A JSON-friendly error object suitable for transport or storage.

## Example

```ts
const s = serializeRichError(err); // send to worker or log store
const e = deserializeRichError(s); // rehydrate when payload is serialized RichError

@public
```
