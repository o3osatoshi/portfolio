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

## Type Aliases

- [Layer](type-aliases/Layer.md)
- [NewError](type-aliases/NewError.md)
- [NewZodError](type-aliases/NewZodError.md)

## Functions

- [isZodError](functions/isZodError.md)
- [newError](functions/newError.md)
- [newZodError](functions/newZodError.md)
- [parseAsyncWith](functions/parseAsyncWith.md)
- [parseWith](functions/parseWith.md)
- [summarizeZodError](functions/summarizeZodError.md)
- [summarizeZodIssue](functions/summarizeZodIssue.md)
