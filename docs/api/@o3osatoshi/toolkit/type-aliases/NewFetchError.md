[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / NewFetchError

# Type Alias: NewFetchError

> **NewFetchError** = `object` & `Omit`\<[`NewRichError`](NewRichError.md), `"details"` \| `"isOperational"` \| `"kind"` \| `"layer"`\>

Defined in: [packages/toolkit/src/http/fetch-error.ts:29](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/http/fetch-error.ts#L29)

Payload accepted by [newFetchError](../functions/newFetchError.md) before shaping a toolkit error.
Mirrors [NewRichError](NewRichError.md) while adding fetch-specific request context.
When `kind` is omitted, the helper falls back to the classification derived
from the request metadata or underlying cause.

## Type Declaration

### cause?

> `optional` **cause**: `unknown`

### details?

> `optional` **details**: [`RichErrorDetails`](RichErrorDetails.md)

### isOperational?

> `optional` **isOperational**: `boolean`

### kind?

> `optional` **kind**: [`Kind`](Kind.md)

### request?

> `optional` **request**: [`FetchRequest`](FetchRequest.md)
