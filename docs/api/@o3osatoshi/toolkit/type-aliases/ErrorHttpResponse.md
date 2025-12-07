[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / ErrorHttpResponse

# Type Alias: ErrorHttpResponse

> **ErrorHttpResponse** = `object`

Defined in: [http/http-error-response.ts:43](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/http/http-error-response.ts#L43)

HTTP‑friendly error response.

## Properties

### body

> **body**: [`SerializedError`](../interfaces/SerializedError.md)

Defined in: [http/http-error-response.ts:45](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/http/http-error-response.ts#L45)

Serialized, JSON‑safe error payload produced by [serializeError](../functions/serializeError.md).

***

### statusCode

> **statusCode**: [`ErrorStatusCode`](ErrorStatusCode.md)

Defined in: [http/http-error-response.ts:47](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/http/http-error-response.ts#L47)

HTTP status code associated with the error.
