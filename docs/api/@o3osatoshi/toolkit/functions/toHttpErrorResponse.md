[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / toHttpErrorResponse

# Function: toHttpErrorResponse()

> **toHttpErrorResponse**(`error`, `status?`, `options?`): [`ErrorHttpResponse`](../type-aliases/ErrorHttpResponse.md)

Defined in: [http/http-error-response.ts:130](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/http/http-error-response.ts#L130)

Convert an `Error` into an HTTP response shape.

- `body` is a stable, JSON‑safe structure created by [serializeError](serializeError.md).
- `status` is inferred from `error.name` (see Kind → Status mapping), unless
  a specific status override is provided.

## Parameters

### error

`Error`

Error instance to convert.

### status?

[`ErrorStatusCode`](../type-aliases/ErrorStatusCode.md)

Optional HTTP status override. If provided, it takes precedence.

### options?

[`SerializeOptions`](../type-aliases/SerializeOptions.md)

Serialization options (depth, includeStack, maxLen).

## Returns

[`ErrorHttpResponse`](../type-aliases/ErrorHttpResponse.md)

A pair of `body` and `status` suitable for HTTP responses.

## Examples

// Next.js Route Handler
```ts
export async function GET() {
  try {
    // ...
  } catch (err) {
    const { body, status } = toHttpErrorResponse(err as Error);
    return Response.json(body, { status });
  }
}
```

// Express middleware
```ts
app.use((err, _req, res, _next) => {
  const { body, status } = toHttpErrorResponse(err);
  res.status(status).json(body);
});
```
