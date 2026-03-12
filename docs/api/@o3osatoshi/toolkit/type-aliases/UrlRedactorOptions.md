[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / UrlRedactorOptions

# Type Alias: UrlRedactorOptions

> **UrlRedactorOptions** = `object`

Defined in: [packages/toolkit/src/http/http-utils.ts:58](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L58)

Options for [createUrlRedactor](../functions/createUrlRedactor.md).

## Properties

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [packages/toolkit/src/http/http-utils.ts:60](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L60)

Placeholder string used to replace matched secrets.

***

### secrets

> **secrets**: (`string` \| `undefined`)[]

Defined in: [packages/toolkit/src/http/http-utils.ts:62](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-utils.ts#L62)

Secrets to redact from URL strings.
