[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / HttpResponse

# Type Alias: HttpResponse\<T\>

> **HttpResponse**\<`T`\> = `object`

Defined in: [packages/toolkit/src/http/response-types.ts:18](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-types.ts#L18)

Normalized HTTP response payload returned by toolkit fetch helpers.

## Type Parameters

### T

`T` = `unknown`

## Properties

### cache?

> `optional` **cache**: `object`

Defined in: [packages/toolkit/src/http/response-types.ts:20](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-types.ts#L20)

Optional cache metadata attached by middleware.

#### hit

> **hit**: `boolean`

Whether the response was served from cache.

#### key?

> `optional` **key**: `string`

Optional cache key that produced the hit/miss.

***

### data

> **data**: `T`

Defined in: [packages/toolkit/src/http/response-types.ts:27](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-types.ts#L27)

Parsed response body.

***

### response

> **response**: `object`

Defined in: [packages/toolkit/src/http/response-types.ts:29](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-types.ts#L29)

Response metadata snapshot.

#### headers

> **headers**: `Headers`

Response headers as provided by Fetch.

#### ok

> **ok**: `boolean`

Whether the response status is within the 2xx range.

#### redirected?

> `optional` **redirected**: `boolean`

Whether the response was the result of a redirect.

#### status

> **status**: `number`

HTTP status code.

#### statusText

> **statusText**: `string`

HTTP status text (for example "OK").

#### url

> **url**: `string`

Final response URL after redirects.

***

### retry?

> `optional` **retry**: `object`

Defined in: [packages/toolkit/src/http/response-types.ts:44](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/response-types.ts#L44)

Optional retry metadata attached by middleware.

#### attempts

> **attempts**: `number`

Number of attempts performed before returning.
