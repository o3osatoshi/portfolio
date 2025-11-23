[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / createExpressRequestHandler

# Function: createExpressRequestHandler()

> **createExpressRequestHandler**(`app`): (`req`, `res`) => `Promise`\<`void`\>

Defined in: [packages/interface/src/http/node/adapter-express.ts:24](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/http/node/adapter-express.ts#L24)

Express-compatible adapter for a Hono app.

Provides a plain Express-style handler `(req, res) => Promise<void>` so that
delivery layers (e.g. Firebase Functions via `onRequest`) can bind the
runtime without this module importing those runtimes directly.

Flow overview:
1) Build an absolute URL from Express request parts.
2) Copy inbound headers from Express into a Fetch `Headers`.
3) Create a Fetch `Request`, marshaling the body for non-GET/HEAD methods.
4) Delegate to the Hono app via `app.fetch(Request)`.
5) Write the returned status code to Express `res`.
6) Forward all response headers (preserving duplicates like `set-cookie`),
   skipping `content-length` to avoid mismatches after re-serialization.
7) Send the response body as JSON or text based on `content-type`.

## Parameters

### app

`Hono`

## Returns

> (`req`, `res`): `Promise`\<`void`\>

### Parameters

#### req

`Request`

#### res

`Response`

### Returns

`Promise`\<`void`\>
