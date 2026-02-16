# @o3osatoshi/toolkit

TypeScript utilities for structured error flows, HTTP/Next helpers, environment validation, and Zod integration.

## Install

```bash
pnpm add @o3osatoshi/toolkit
```

## Import Policy

`@o3osatoshi/toolkit` currently exposes only the package root export.

```ts
import {
  deserializeRichError,
  err,
  newRichError,
  ok,
  parseWith,
  serializeRichError,
  toRichError,
} from "@o3osatoshi/toolkit";
```

## Quick Start

### Structured RichError

```ts
import { newRichError } from "@o3osatoshi/toolkit";

throw newRichError({
  layer: "Application",
  kind: "Validation",
  code: "APP_CREATE_USER_INVALID_EMAIL",
  i18n: { key: "errors.application.validation", params: { field: "email" } },
  details: {
    action: "CreateUser",
    reason: "Email format is invalid.",
    impact: "User cannot be registered.",
    hint: "Ensure the email includes '@'.",
  },
  isOperational: true,
  meta: { requestId: "req_123" },
});
// name: ApplicationValidationError
// message: "CreateUser failed: Email format is invalid."
```

### Normalize unknown errors

```ts
import { toRichError } from "@o3osatoshi/toolkit";

try {
  await doSomething();
} catch (cause) {
  const error = toRichError(cause, {
    code: "APP_DO_SOMETHING_FAILED",
    details: { action: "DoSomething" },
    layer: "Application",
  });

  // always RichError
  console.error(error.code, error.kind, error.layer);
}
```

### Serialize / deserialize

```ts
import {
  deserializeRichError,
  newRichError,
  serializeRichError,
} from "@o3osatoshi/toolkit";

const original = newRichError({
  code: "APP_INTERNAL",
  details: { action: "LoadDashboard", reason: "Cache unavailable." },
  i18n: { key: "errors.application.internal" },
  isOperational: false,
  kind: "Internal",
  layer: "Application",
});

const payload = serializeRichError(original);
const restored = deserializeRichError(payload);
```

### Zod integration

```ts
import { parseWith } from "@o3osatoshi/toolkit";
import { z } from "zod";

const userSchema = z.object({
  age: z.number().min(0),
  name: z.string(),
});

const parseUser = parseWith(userSchema, {
  action: "ParseUser",
  layer: "Presentation",
});

const result = parseUser({ age: 20, name: "alice" });
// Result<{ age: number; name: string }, RichError>
```

## Error Kind Reference

`toHttpErrorResponse` uses the following default `Kind -> statusCode` mapping:

| Kind | statusCode | Meaning |
| --- | --- | --- |
| `BadRequest` | 400 | Malformed request input before domain validation. |
| `Validation` | 400 | Domain/application validation failure. |
| `Unauthorized` | 401 | Authentication missing/invalid. |
| `Forbidden` | 403 | Authenticated but not permitted. |
| `NotFound` | 404 | Resource/entity missing. |
| `MethodNotAllowed` | 405 | HTTP method is not supported. |
| `Canceled` | 408 | Request canceled/aborted. |
| `Conflict` | 409 | State/version conflict. |
| `Unprocessable` | 422 | Semantically invalid request. |
| `RateLimit` | 429 | Throttling/quota exceeded. |
| `Internal` | 500 | Unexpected internal failure. |
| `Serialization` | 500 | Encode/decode failure. |
| `BadGateway` | 502 | Upstream responded invalidly. |
| `Unavailable` | 503 | Dependency/service temporarily unavailable. |
| `Timeout` | 504 | Upstream/local operation timed out. |

## Next.js Action helpers

For Server Actions and `useActionState`, use `ok`/`err` from the same root package.

```ts
import {
  err,
  ok,
  toRichError,
  type ActionState,
} from "@o3osatoshi/toolkit";

export async function createItem(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  try {
    const data = await doSomething(formData);
    return ok(data);
  } catch (cause) {
    return err(toRichError(cause));
  }
}
```

`err(...)` serializes `RichError` as `SerializedRichError` (stack omitted) for safe transport.

## API Highlights

- `newRichError(params)`
- `toRichError(error, fallback?)`
- `serializeRichError(error, options?)`
- `deserializeRichError(input, options?)`
- `tryDeserializeRichError(input)`
- `toHttpErrorResponse(error, statusOverride?, serializeOptions?)`
- `newFetchError(options)`
- `createEnv(schema, options?)`
- `createLazyEnv(schema, options?)`
- `newZodError(options)`
- `parseWith(schema, context)`
- `ok(data)` / `err(error)` / `ActionState`
- `unwrapResultAsync(result)`

## Quality

- Test: `pnpm -C packages/toolkit test`
- Coverage: `pnpm -C packages/toolkit test:cvrg`
- Typecheck: `pnpm -C packages/toolkit typecheck`
- API extract: `pnpm -C packages/toolkit api:extract`
