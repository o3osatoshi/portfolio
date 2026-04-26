[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / isSerializedError

# Function: isSerializedError()

> **isSerializedError**(`v`): `v is SerializedError`

Defined in: [packages/toolkit/src/error/error-serializer.ts:152](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L152)

Lightweight structural guard for [SerializedError](../type-aliases/SerializedError.md).

- Checks only for minimal shape (`name` and `message`).
- For strict RichError validation, prefer [tryDeserializeRichError](tryDeserializeRichError.md).

## Parameters

### v

`unknown`

## Returns

`v is SerializedError`
