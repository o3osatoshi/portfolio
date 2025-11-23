[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / isSerializedError

# Function: isSerializedError()

> **isSerializedError**(`v`): `v is SerializedError`

Defined in: [error/error-serializer.ts:117](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/error/error-serializer.ts#L117)

Lightweight structural guard for [SerializedError](../interfaces/SerializedError.md).

- Checks only for minimal shape (`name` and `message`).
- For strict validation and nested `cause` guarantees, prefer [deserializeError](deserializeError.md).

## Parameters

### v

`unknown`

## Returns

`v is SerializedError`
