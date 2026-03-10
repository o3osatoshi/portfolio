[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / createUrlRedactor

# Function: createUrlRedactor()

> **createUrlRedactor**(`options`): (`url`) => `string`

Defined in: [packages/toolkit/src/http/http-utils.ts:72](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L72)

Create a URL redactor that replaces configured secrets with a placeholder.

## Parameters

### options

[`UrlRedactorOptions`](../type-aliases/UrlRedactorOptions.md)

Redactor options.

## Returns

Function that redacts secrets in URLs.

> (`url`): `string`

### Parameters

#### url

`string`

### Returns

`string`
