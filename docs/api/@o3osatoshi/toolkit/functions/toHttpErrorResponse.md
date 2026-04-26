[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / toHttpErrorResponse

# Function: toHttpErrorResponse()

> **toHttpErrorResponse**(`error`, `status?`, `options?`): [`ErrorHttpResponse`](../type-aliases/ErrorHttpResponse.md)

Defined in: [packages/toolkit/src/http/http-error-response.ts:123](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/http-error-response.ts#L123)

Convert an unknown error-like value into an HTTP response shape.

- `body` is a stable, JSON‑safe structure created by [serializeRichError](serializeRichError.md).
- `status` is inferred from normalized `RichError.kind` (see Kind → Status
  mapping), unless a specific status override is provided.

## Parameters

### error

`unknown`

Unknown value to convert into a structured error response.

### status?

[`ErrorStatusCode`](../type-aliases/ErrorStatusCode.md)

Optional HTTP status override. If provided, it takes precedence.

### options?

[`SerializeOptions`](../type-aliases/SerializeOptions.md)

Serialization options (depth, includeStack).

## Returns

[`ErrorHttpResponse`](../type-aliases/ErrorHttpResponse.md)

A pair of `body` and `statusCode` suitable for HTTP responses.

## Examples

// Next.js Route Handler
```ts
export async function GET() {
  try {
    // ...
  } catch (err) {
    const { body, statusCode } = toHttpErrorResponse(err);
    return Response.json(body, { status: statusCode });
  }
}
```

// Express middleware
```ts
app.use((err, _req, res, _next) => {
  const { body, statusCode } = toHttpErrorResponse(err);
  res.status(statusCode).json(body);
});
```
