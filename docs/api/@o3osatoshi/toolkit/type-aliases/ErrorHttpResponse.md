[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / ErrorHttpResponse

# Type Alias: ErrorHttpResponse

> **ErrorHttpResponse** = `object`

Defined in: [packages/toolkit/src/http/http-error-response.ts:39](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-error-response.ts#L39)

HTTP‑friendly error response.

## Properties

### body

> **body**: [`SerializedError`](SerializedError.md)

Defined in: [packages/toolkit/src/http/http-error-response.ts:41](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-error-response.ts#L41)

Serialized, JSON‑safe error payload produced by [serializeRichError](../functions/serializeRichError.md).

***

### statusCode

> **statusCode**: [`ErrorStatusCode`](ErrorStatusCode.md)

Defined in: [packages/toolkit/src/http/http-error-response.ts:43](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-error-response.ts#L43)

HTTP status code associated with the error.
