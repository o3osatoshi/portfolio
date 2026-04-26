[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / SerializedError

# Type Alias: SerializedError

> **SerializedError** = `object`

Defined in: [packages/toolkit/src/error/error-schema.ts:122](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L122)

JSON-friendly representation of an Error instance for cross-boundary transport.

## Properties

### cause?

> `optional` **cause**: `SerializedError` \| `string`

Defined in: [packages/toolkit/src/error/error-schema.ts:123](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L123)

***

### code?

> `optional` **code**: `string`

Defined in: [packages/toolkit/src/error/error-schema.ts:124](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L124)

***

### details?

> `optional` **details**: [`RichErrorDetails`](RichErrorDetails.md)

Defined in: [packages/toolkit/src/error/error-schema.ts:125](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L125)

***

### i18n?

> `optional` **i18n**: [`RichErrorI18n`](RichErrorI18n.md)

Defined in: [packages/toolkit/src/error/error-schema.ts:126](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L126)

***

### isOperational?

> `optional` **isOperational**: `boolean`

Defined in: [packages/toolkit/src/error/error-schema.ts:127](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L127)

***

### kind?

> `optional` **kind**: [`Kind`](Kind.md)

Defined in: [packages/toolkit/src/error/error-schema.ts:128](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L128)

***

### layer?

> `optional` **layer**: [`Layer`](Layer.md)

Defined in: [packages/toolkit/src/error/error-schema.ts:129](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L129)

***

### message

> **message**: `string`

Defined in: [packages/toolkit/src/error/error-schema.ts:130](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L130)

***

### meta?

> `optional` **meta**: `z.infer`\<*typeof* [`jsonObjectSchema`](../variables/jsonObjectSchema.md)\>

Defined in: [packages/toolkit/src/error/error-schema.ts:131](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L131)

***

### name

> **name**: `string`

Defined in: [packages/toolkit/src/error/error-schema.ts:132](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L132)

***

### stack?

> `optional` **stack**: `string`

Defined in: [packages/toolkit/src/error/error-schema.ts:133](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L133)
