[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / DeserializeRichErrorOptions

# Type Alias: DeserializeRichErrorOptions

> **DeserializeRichErrorOptions** = `object`

Defined in: [packages/toolkit/src/error/error-serializer.ts:54](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L54)

Options for [deserializeRichError](../functions/deserializeRichError.md).

## Properties

### action?

> `optional` **action**: `string`

Defined in: [packages/toolkit/src/error/error-serializer.ts:60](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L60)

Action label stored in the fallback RichError details.

#### Default Value

```ts
"DeserializeRichError"
```

***

### code?

> `optional` **code**: `string`

Defined in: [packages/toolkit/src/error/error-serializer.ts:66](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L66)

Error code used when deserialization fails.

#### Default Value

```ts
"RICH_ERROR_DESERIALIZE_FAILED"
```

***

### i18nKey?

> `optional` **i18nKey**: `string`

Defined in: [packages/toolkit/src/error/error-serializer.ts:72](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L72)

i18n key used when deserialization fails.

#### Default Value

```ts
"errors.transport.deserialize_failed"
```

***

### layer?

> `optional` **layer**: [`Layer`](Layer.md)

Defined in: [packages/toolkit/src/error/error-serializer.ts:78](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L78)

Layer used for the fallback deserialization failure error.

#### Default Value

```ts
"External"
```

***

### meta?

> `optional` **meta**: [`JsonObject`](JsonObject.md)

Defined in: [packages/toolkit/src/error/error-serializer.ts:82](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L82)

Additional JSON-safe metadata merged into fallback deserialization errors.

***

### source?

> `optional` **source**: `string`

Defined in: [packages/toolkit/src/error/error-serializer.ts:86](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-serializer.ts#L86)

Optional source identifier added to fallback metadata.
