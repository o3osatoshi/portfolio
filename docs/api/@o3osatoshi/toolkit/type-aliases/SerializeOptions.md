[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / SerializeOptions

# Type Alias: SerializeOptions

> **SerializeOptions** = `object`

Defined in: [error/error-serializer.ts:39](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error-serializer.ts#L39)

Tuning knobs for [serializeError](../functions/serializeError.md).

## Properties

### depth?

> `optional` **depth**: `number`

Defined in: [error/error-serializer.ts:41](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error-serializer.ts#L41)

Maximum depth of `cause` chain to serialize (default: 2).

***

### includeStack?

> `optional` **includeStack**: `boolean`

Defined in: [error/error-serializer.ts:43](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error-serializer.ts#L43)

Include `stack` in output (default: true in development, false otherwise).
