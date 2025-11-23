[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / NewFetchError

# Type Alias: NewFetchError

> **NewFetchError** = `object`

Defined in: [http/fetch-error.ts:26](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/http/fetch-error.ts#L26)

Payload accepted by [newFetchError](../functions/newFetchError.md) before shaping a toolkit error.
Mirrors [NewError](NewError.md) while adding fetch-specific request context.
When `kind` is omitted, the helper falls back to the classification derived
from the request metadata or underlying cause.

## Properties

### action?

> `optional` **action**: `string`

Defined in: [http/fetch-error.ts:27](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/http/fetch-error.ts#L27)

***

### cause?

> `optional` **cause**: `unknown`

Defined in: [http/fetch-error.ts:28](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/http/fetch-error.ts#L28)

***

### hint?

> `optional` **hint**: `string`

Defined in: [http/fetch-error.ts:29](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/http/fetch-error.ts#L29)

***

### impact?

> `optional` **impact**: `string`

Defined in: [http/fetch-error.ts:30](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/http/fetch-error.ts#L30)

***

### kind?

> `optional` **kind**: [`Kind`](Kind.md)

Defined in: [http/fetch-error.ts:31](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/http/fetch-error.ts#L31)

***

### request?

> `optional` **request**: [`FetchRequest`](FetchRequest.md)

Defined in: [http/fetch-error.ts:32](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/http/fetch-error.ts#L32)
