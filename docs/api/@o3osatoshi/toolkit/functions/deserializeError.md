[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / deserializeError

# Function: deserializeError()

> **deserializeError**(`input`): `Error`

Defined in: [error/error-serializer.ts:59](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/error/error-serializer.ts#L59)

Reconstruct an `Error` instance from unknown input.

- Validates the input against an internal Zod schema compatible with [SerializedError](../interfaces/SerializedError.md).
- On schema success, restores `name`/`message`/`stack` and recursively rehydrates `cause`.
- On schema failure, builds a best-effort `Error` using [extractErrorName](extractErrorName.md) and [extractErrorMessage](extractErrorMessage.md).
- If `input` is already an `Error`, it is returned as-is.
- Uses native `ErrorOptions` (`new Error(message, { cause })`) when available; otherwise attaches `cause` via `defineProperty`.

## Parameters

### input

`unknown`

Unknown value expected to represent a serialized error.

## Returns

`Error`

Rehydrated `Error` with best-effort `cause` restoration.
