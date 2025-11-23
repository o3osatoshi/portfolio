[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / SerializedCause

# Type Alias: SerializedCause

> **SerializedCause** = [`SerializedError`](../interfaces/SerializedError.md) \| `string`

Defined in: [error/error-serializer.ts:13](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/error/error-serializer.ts#L13)

Union used to represent an error's `cause` in serialized form.

- A primitive `string` is preserved as-is.
- A nested [SerializedError](../interfaces/SerializedError.md) captures structured error details recursively.
