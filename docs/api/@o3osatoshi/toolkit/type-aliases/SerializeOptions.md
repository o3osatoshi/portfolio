[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / SerializeOptions

# Type Alias: SerializeOptions

> **SerializeOptions** = `object`

Defined in: [packages/toolkit/src/error/error-serializer.ts:94](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L94)

Tuning knobs for [serializeRichError](../functions/serializeRichError.md).

## Properties

### depth?

> `optional` **depth**: `number`

Defined in: [packages/toolkit/src/error/error-serializer.ts:96](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L96)

Maximum depth of `cause` chain to serialize (default: 2).

***

### includeCause?

> `optional` **includeCause**: `boolean`

Defined in: [packages/toolkit/src/error/error-serializer.ts:98](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L98)

Include `cause` chain in output (default: true).

***

### includeStack?

> `optional` **includeStack**: `boolean`

Defined in: [packages/toolkit/src/error/error-serializer.ts:100](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L100)

Include `stack` in output (default: true in development, false otherwise).
