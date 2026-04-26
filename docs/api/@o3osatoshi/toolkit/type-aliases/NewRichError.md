[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / NewRichError

# Type Alias: NewRichError

> **NewRichError** = `object`

Defined in: [packages/toolkit/src/error/error.ts:23](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L23)

Input payload used when creating [RichError](../classes/RichError.md).

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: [packages/toolkit/src/error/error.ts:25](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L25)

Original cause (any type) captured for diagnostic context.

***

### code?

> `optional` **code**: `string`

Defined in: [packages/toolkit/src/error/error.ts:27](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L27)

Machine-stable identifier (analytics / i18n routing / client logic).

***

### details?

> `optional` **details**: [`RichErrorDetails`](RichErrorDetails.md)

Defined in: [packages/toolkit/src/error/error.ts:29](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L29)

Additional human context intended for diagnostics.

***

### i18n?

> `optional` **i18n**: [`RichErrorI18n`](RichErrorI18n.md)

Defined in: [packages/toolkit/src/error/error.ts:31](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L31)

UI-friendly i18n key + params (not translated here).

***

### isOperational

> **isOperational**: `boolean`

Defined in: [packages/toolkit/src/error/error.ts:33](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L33)

Indicates whether the error is an expected operational failure.

***

### kind

> **kind**: [`Kind`](Kind.md)

Defined in: [packages/toolkit/src/error/error.ts:35](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L35)

High-level error classification shared across layers.

***

### layer

> **layer**: [`Layer`](Layer.md)

Defined in: [packages/toolkit/src/error/error.ts:37](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L37)

Architectural layer where the failure originated.

***

### meta?

> `optional` **meta**: [`JsonObject`](JsonObject.md)

Defined in: [packages/toolkit/src/error/error.ts:39](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L39)

JSON-safe metadata (diagnostics, debugging, metrics).
