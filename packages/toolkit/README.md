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
import { newRichError } from "@o3osatoshi/toolkit";

throw newRichError({
  layer: "Application",
  kind: "Validation",
  code: "user.email_invalid",
  i18n: { key: "error.user_email_invalid", params: { field: "email" } },
  details: {
    action: "CreateUser",
    reason: "email format is invalid",
    impact: "user cannot be registered",
    hint: "ensure email has @",
  },
  cause: new Error("zod: Expected string, received number"),
  meta: { requestId: "req_123" },
});
// name: ApplicationValidationError
// message example: "CreateUser failed: email format is invalid"
```

### Zod integration

```ts
import { z } from "zod";
import { parseWith, newZodError } from "@o3osatoshi/toolkit";

const userSchema = z.object({ name: z.string(), age: z.number().min(0) });

const parseUser = parseWith(userSchema, {
  details: { action: "ParseUser" },
  layer: "Presentation",
});
const res = parseUser({ name: "alice", age: 20 }); // Result<User, Error>

// When you catch a ZodError and want a normalized Error:
try {
  userSchema.parse({ name: 1 });
} catch (e) {
  throw newZodError({ details: { action: "ParseUser" }, cause: e });
}
```

### Error kinds

`newRichError` expects a `kind` that conveys how callers or HTTP layers should react. The defaults below are what `toHttpErrorResponse` uses when translating errors into status codes (override as needed):

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
| `Canceled`       | 408                 | Caller aborted or connection closed mid-flight. |
| `Config`         | 500                 | Server-side misconfiguration or missing secrets. |
| `Serialization`  | 500                 | Encode/decode failure when handling data. |
| `Unknown`        | 500                 | Fallback when no other kind matches. |
| `BadGateway`     | 502                 | Upstream dependency returned an invalid or 5xx response. |
| `Unavailable`    | 503                 | Dependency temporarily offline or service paused. |
| `Timeout`        | 504                 | Operation exceeded configured timeout. |

Note: Some gateways use non‑standard 499 (Client Closed Request). The default mapping here uses 408 for broader compatibility.

## API

- `newRichError(opts)`
  - Builds a `RichError` with a consistent `name` (`<Layer><Kind>Error`) and a concise `message` summary derived from `details`.
- `isZodError(e)`
  - Robust detection using `instanceof` or duck-typing fallback when Zod instances differ.
- `summarizeZodIssue(issue)` / `summarizeZodError(err)`
  - Human‑readable messages for common Zod issues.
- `newZodError(opts)`
  - Wraps a `ZodError` (or issues array) into a structured `RichError` via `newRichError`.
- `parseWith(schema, ctx)`
  - Create a function returning `neverthrow` `Result` from a Zod schema. Errors are normalized via `newZodError`.
- `createEnv(schema, opts?)`
  - Validate environment variables with Zod and return a fully typed configuration object. Accepts an optional `name` label (used in error messages) and `source` map (useful for tests or SSR).
- `Env`
  - String union type for canonical deployment environments (`"development" | "local" | "production" | "staging"`), shared across packages (for example, telemetry configuration) to avoid ad‑hoc string literals.
- `EnvOf<T>`, `EnvSchema`
  - Helper types for `createEnv`. `EnvSchema` models the map of variable names to Zod validators, and `EnvOf<T>` infers the resulting runtime shape from that schema.
- `@o3osatoshi/toolkit/next`
  - Helpers for Next.js Server Actions. See below.

## Next.js helpers (`@o3osatoshi/toolkit/next`)

Lightweight utilities for `useActionState` and Server Actions.

```ts
import {
  err,
  ok,
  type ActionState,
  userMessageFromError,
} from "@o3osatoshi/toolkit/next";

// Server Action example
export const createItem = async (
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const data = await doSomething(formData);
    return ok(data);
  } catch (e) {
    return err(e as Error); // serializable ActionError (includes i18n/code when RichError)
  }
};
```

- `err(error)` – accepts `Error | ActionError | string` and returns `{ ok: false, error }`. When given `RichError`, it preserves `code`, `i18n`, `kind`, and `layer` for presentation-layer localization/branching.
- `ok(data)` – wraps success payload as `{ ok: true, data }`.
- `userMessageFromError(error)` – returns a fallback display string from `details` / plain message when i18n lookup is unavailable.

## Notes

- ESM + CJS outputs are provided; typings are included.
- Target Node >= 22 (see `engines`).
- When targeting different Zod instances (e.g., multiple versions), `isZodError` uses duck typing to remain resilient.
- `pnpm -C packages/toolkit dev` uses `tsup --watch --no-clean` to avoid brief `dist` removals that can break dependent watch builds (e.g. `@o3osatoshi/logging`). Run `pnpm -C packages/toolkit clean` after export changes to prevent stale artifacts.

## Quality

- Tests: `pnpm -C packages/toolkit test` / `pnpm -C packages/toolkit test:cvrg`
- Coverage: [![Coverage: @o3osatoshi/toolkit](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=toolkit)](https://app.codecov.io/github/o3osatoshi/portfolio?component=toolkit)
