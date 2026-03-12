[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / BuildHttpResponseOptions

# Type Alias: BuildHttpResponseOptions

> **BuildHttpResponseOptions** = `object`

Defined in: [packages/toolkit/src/http/response-builder.ts:8](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-builder.ts#L8)

Optional metadata attached to a [HttpResponse](HttpResponse.md).

## Properties

### cache?

> `optional` **cache**: `object`

Defined in: [packages/toolkit/src/http/response-builder.ts:10](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-builder.ts#L10)

Cache metadata attached by middleware.

#### hit

> **hit**: `boolean`

#### key?

> `optional` **key**: `string`

***

### retry?

> `optional` **retry**: `object`

Defined in: [packages/toolkit/src/http/response-builder.ts:12](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-builder.ts#L12)

Retry metadata attached by middleware.

#### attempts

> **attempts**: `number`
