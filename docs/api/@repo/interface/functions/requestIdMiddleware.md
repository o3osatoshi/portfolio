[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / requestIdMiddleware

# Function: requestIdMiddleware()

> **requestIdMiddleware**(`c`, `next`): `Promise`\<`void`\>

Defined in: [packages/interface/src/http/core/middlewares.ts:28](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/interface/src/http/core/middlewares.ts#L28)

Simple request id middleware.

- Uses an incoming `x-request-id` header when present.
- Otherwise generates a UUID (when available) and sets it on the response.
- Also stores the id in the context under the `requestId` key.

## Parameters

### c

`Context`

Hono context for the current request.

### next

`Next`

Function to invoke the downstream handler/middleware.

## Returns

`Promise`\<`void`\>
