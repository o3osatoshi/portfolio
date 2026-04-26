[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / FormatHttpStatusReasonOptions

# Type Alias: FormatHttpStatusReasonOptions

> **FormatHttpStatusReasonOptions** = `object`

Defined in: [packages/toolkit/src/http/http-utils.ts:10](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L10)

Inputs for [formatHttpStatusReason](../functions/formatHttpStatusReason.md).

## Properties

### maxPayloadLength?

> `optional` **maxPayloadLength**: `null` \| `number`

Defined in: [packages/toolkit/src/http/http-utils.ts:15](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L15)

Maximum payload length before truncation. Use `null` to disable truncation.
When omitted, the default truncation length is applied.

***

### payload

> **payload**: `unknown`

Defined in: [packages/toolkit/src/http/http-utils.ts:17](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L17)

Response payload used to build a compact preview.

***

### response

> **response**: [`HttpStatusLike`](HttpStatusLike.md)

Defined in: [packages/toolkit/src/http/http-utils.ts:19](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L19)

Response object providing status metadata.

***

### serviceName

> **serviceName**: `string`

Defined in: [packages/toolkit/src/http/http-utils.ts:21](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L21)

External service name to include in the formatted reason.
