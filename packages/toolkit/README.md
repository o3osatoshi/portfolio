# @o3osatoshi/toolkit

Utility helpers for error shaping and Zod integration, designed for TypeScript apps.

## Install

```bash
pnpm add @o3osatoshi/toolkit                # runtime
pnpm add -D typescript vitest               # dev (optional for typecheck/tests)
```

## Quick Start

### Structured errors

```ts
import { newError } from "@o3osatoshi/toolkit";

throw newError({
  layer: "Application",
  kind: "Validation",
  action: "CreateUser",
  reason: "email format is invalid",
  impact: "user cannot be registered",
  hint: "ensure email has @",
  cause: new Error("zod: Expected string, received number"),
});
// name: ApplicationValidationError
// message example: "CreateUser failed because email format is invalid. Impact: user cannot be registered. Hint: ensure email has @. Cause: zod: Expected string, received number."
```

### Zod integration

```ts
import { z } from "zod";
import { parseWith, parseAsyncWith, newZodError } from "@o3osatoshi/toolkit";

const userSchema = z.object({ name: z.string(), age: z.number().min(0) });

const parseUser = parseWith(userSchema, { action: "ParseUser", layer: "UI" });
const res = parseUser({ name: "alice", age: 20 }); // Result<User, Error>

// Async
const parseUserAsync = parseAsyncWith(userSchema, { action: "ParseUser", layer: "UI" });
const resAsync = await parseUserAsync({ name: "alice", age: 20 }); // ResultAsync<User, Error>

// When you catch a ZodError and want a normalized Error:
try {
  userSchema.parse({ name: 1 });
} catch (e) {
  throw newZodError({ action: "ParseUser", cause: e });
}
```

### Error kinds

`newError` expects a `kind` that conveys how callers or HTTP layers should react. The defaults below are what `toHttpErrorResponse` uses when translating errors into status codes (override as needed):

| Kind             | Default HTTP status | Description |
| ---------------- | ------------------- | ----------- |
| `BadRequest`     | 400                 | Malformed payload or transport-level input issue caught before validation. |
| `Validation`     | 400                 | Domain/application validation failure (e.g., Zod, business rules). |
| `Unauthorized`   | 401                 | Authentication missing, expired, or invalid. |
| `Forbidden`      | 403                 | Authenticated caller lacks permission. |
| `NotFound`       | 404                 | Entity, route, or resource is missing. |
| `MethodNotAllowed` | 405               | HTTP verb is not supported for the requested resource. |
| `Conflict`       | 409                 | Version/state conflict such as optimistic locking. |
| `Integrity`      | 409                 | Constraint violation (unique/index/foreign key). |
| `Deadlock`       | 409                 | Database or concurrency deadlock detected by the engine. |
| `Unprocessable`  | 422                 | Semantically invalid request despite being well-formed. |
| `RateLimit`      | 429                 | Quota exceeded or throttling triggered. |
| `Canceled`       | 499†                | Caller aborted or connection closed mid-flight. |
| `Config`         | 500                 | Server-side misconfiguration or missing secrets. |
| `Serialization`  | 500                 | Encode/decode failure when handling data. |
| `Unknown`        | 500                 | Fallback when no other kind matches. |
| `BadGateway`     | 502                 | Upstream dependency returned an invalid or 5xx response. |
| `Unavailable`    | 503                 | Dependency temporarily offline or service paused. |
| `Timeout`        | 504                 | Operation exceeded configured timeout. |

† `499` represents "Client Closed Request", a non-standard code that many gateways use; feel free to override if your platform reserves a different response.

## API

- `newError(opts)`
  - Builds an `Error` with a consistent `name` (`<Layer><Kind>Error`) and rich `message` composed from `action`, `reason`, `impact`, `hint`, and a summarized `cause`.
- `isZodError(e)`
  - Robust detection using `instanceof` or duck-typing fallback when Zod instances differ.
- `summarizeZodIssue(issue)` / `summarizeZodError(err)`
  - Human‑readable messages for common Zod issues.
- `newZodError(opts)`
  - Wraps a `ZodError` (or issues array) into a structured `Error` via `newError`.
- `parseWith(schema, ctx)` / `parseAsyncWith(schema, ctx)`
  - Create functions returning `neverthrow` `Result` / `ResultAsync` from a Zod schema. Errors are normalized via `newZodError`.

## Notes

- ESM + CJS outputs are provided; typings are included.
- Target Node >= 22 (see `engines`).
- When targeting different Zod instances (e.g., multiple versions), `isZodError` uses duck typing to remain resilient.
