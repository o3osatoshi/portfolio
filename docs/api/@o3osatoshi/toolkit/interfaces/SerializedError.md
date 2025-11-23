[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / SerializedError

# Interface: SerializedError

Defined in: [error/error-serializer.ts:23](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/error/error-serializer.ts#L23)

JSON-friendly representation of an `Error` instance.

Designed for cross-boundary transport (logs, workers, RPC) while keeping
payloads bounded and safe by default.

## Properties

### cause?

> `optional` **cause**: [`SerializedCause`](../type-aliases/SerializedCause.md)

Defined in: [error/error-serializer.ts:25](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/error/error-serializer.ts#L25)

Optional cause; can be a string or another serialized error.

***

### message

> **message**: `string`

Defined in: [error/error-serializer.ts:27](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/error/error-serializer.ts#L27)

Error message.

***

### name

> **name**: `string`

Defined in: [error/error-serializer.ts:29](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/error/error-serializer.ts#L29)

Original error name (e.g. `TypeError`, `DomainValidationError`).

***

### stack?

> `optional` **stack**: `string`

Defined in: [error/error-serializer.ts:31](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/error/error-serializer.ts#L31)

Optional stack trace (included only when `includeStack` is true).
