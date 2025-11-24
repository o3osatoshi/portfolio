[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @o3osatoshi/toolkit

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
| `Canceled`       | 408                 | Caller aborted or connection closed mid-flight. |
| `Config`         | 500                 | Server-side misconfiguration or missing secrets. |
| `Serialization`  | 500                 | Encode/decode failure when handling data. |
| `Unknown`        | 500                 | Fallback when no other kind matches. |
| `BadGateway`     | 502                 | Upstream dependency returned an invalid or 5xx response. |
| `Unavailable`    | 503                 | Dependency temporarily offline or service paused. |
| `Timeout`        | 504                 | Operation exceeded configured timeout. |

Note: Some gateways use non‑standard 499 (Client Closed Request). The default mapping here uses 408 for broader compatibility.

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
    return err(e as Error); // user-facing message derived from toolkit error metadata
  }
};
```

- `err(error)` – accepts `Error | ActionError | string` and returns `{ ok: false, error }` with a user-friendly message derived from `@o3osatoshi/toolkit` errors (`kind`, `reason`, `hint`, `impact` are considered). Falls back to a generic safe message.
- `ok(data)` – wraps success payload as `{ ok: true, data }`.
- `userMessageFromError(error)` – converts an `Error` (ideally produced by `newError`) into user-facing copy, using kind-based defaults and any structured message fields.

## Notes

- ESM + CJS outputs are provided; typings are included.
- Target Node >= 22 (see `engines`).
- When targeting different Zod instances (e.g., multiple versions), `isZodError` uses duck typing to remain resilient.

Toolkit utilities for structured errors and Zod helpers.

## Interfaces

- [SerializedError](interfaces/SerializedError.md)

## Type Aliases

- [ActionData](type-aliases/ActionData.md)
- [ActionError](type-aliases/ActionError.md)
- [ActionState](type-aliases/ActionState.md)
- [CreateEnvOptions](type-aliases/CreateEnvOptions.md)
- [EnvOf](type-aliases/EnvOf.md)
- [EnvSchema](type-aliases/EnvSchema.md)
- [ErrorHttpResponse](type-aliases/ErrorHttpResponse.md)
- [ErrorMessageParts](type-aliases/ErrorMessageParts.md)
- [ErrorMessagePayload](type-aliases/ErrorMessagePayload.md)
- [ErrorNameParts](type-aliases/ErrorNameParts.md)
- [ErrorStatusCode](type-aliases/ErrorStatusCode.md)
- [FetchRequest](type-aliases/FetchRequest.md)
- [Kind](type-aliases/Kind.md)
- [Layer](type-aliases/Layer.md)
- [NewError](type-aliases/NewError.md)
- [NewFetchError](type-aliases/NewFetchError.md)
- [NewZodError](type-aliases/NewZodError.md)
- [Object](type-aliases/Object.md)
- [SerializedCause](type-aliases/SerializedCause.md)
- [SerializeOptions](type-aliases/SerializeOptions.md)
- [SleepOptions](type-aliases/SleepOptions.md)

## Functions

- [composeErrorMessage](functions/composeErrorMessage.md)
- [composeErrorName](functions/composeErrorName.md)
- [createEnv](functions/createEnv.md)
- [deserializeError](functions/deserializeError.md)
- [err](functions/err.md)
- [extractErrorMessage](functions/extractErrorMessage.md)
- [extractErrorName](functions/extractErrorName.md)
- [formatFetchTarget](functions/formatFetchTarget.md)
- [isSerializedError](functions/isSerializedError.md)
- [isZodError](functions/isZodError.md)
- [newError](functions/newError.md)
- [newFetchError](functions/newFetchError.md)
- [newZodError](functions/newZodError.md)
- [ok](functions/ok.md)
- [parseAsyncWith](functions/parseAsyncWith.md)
- [parseErrorMessage](functions/parseErrorMessage.md)
- [parseErrorName](functions/parseErrorName.md)
- [parseWith](functions/parseWith.md)
- [serializeError](functions/serializeError.md)
- [sleep](functions/sleep.md)
- [summarizeZodError](functions/summarizeZodError.md)
- [summarizeZodIssue](functions/summarizeZodIssue.md)
- [toHttpErrorResponse](functions/toHttpErrorResponse.md)
- [truncate](functions/truncate.md)
- [userMessageFromError](functions/userMessageFromError.md)
