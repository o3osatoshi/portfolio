[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / SerializedRichError

# Type Alias: SerializedRichError

> **SerializedRichError** = `object` & `Omit`\<[`SerializedError`](SerializedError.md), `"isOperational"` \| `"kind"` \| `"layer"`\>

Defined in: [packages/toolkit/src/error/error-schema.ts:168](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L168)

Strict RichError transport shape.

Unlike [SerializedError](SerializedError.md), this shape always includes both `kind` and `layer`.

## Type Declaration

### isOperational

> **isOperational**: `boolean`

### kind

> **kind**: [`Kind`](Kind.md)

### layer

> **layer**: [`Layer`](Layer.md)
