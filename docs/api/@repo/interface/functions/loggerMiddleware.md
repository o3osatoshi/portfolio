[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / loggerMiddleware

# Function: loggerMiddleware()

> **loggerMiddleware**(`c`, `next`): `Promise`\<`void`\>

Defined in: [packages/interface/src/http/core/middlewares.ts:10](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/interface/src/http/core/middlewares.ts#L10)

Minimal request logger middleware.
Logs: HTTP method, path, response status, and elapsed time in ms.

## Parameters

### c

`Context`

Hono context for the current request.

### next

`Next`

Function to invoke the downstream handler/middleware.

## Returns

`Promise`\<`void`\>
