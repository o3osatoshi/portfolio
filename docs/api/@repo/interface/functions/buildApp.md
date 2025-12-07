[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / buildApp

# Function: buildApp()

> **buildApp**(`deps`): `Hono`\<\{ \}, \{ `/api/*`: \{ \}; \} \| `MergeSchemaPath`\<\{ `/*`: \{ \}; \}, `"/api/auth"`\> \| `MergeSchemaPath`\<\{ `/healthz`: \{ `$get`: \{ `input`: \{ \}; `output`: \{ `ok`: `true`; \}; `outputFormat`: `"json"`; `status`: `ContentfulStatusCode`; \}; \}; \}, `"/api/public"`\> \| `MergeSchemaPath`\<`object` & `object`, `"/api/private"`\>, `"/api"`\>

Defined in: [packages/interface/src/http/node/app.ts:53](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/interface/src/http/node/app.ts#L53)

Build the Node HTTP application.

Routes (mounted under `/api`):
- `/auth/*` — Auth.js handlers.
- `/public/*` — Routes that do not require authentication.
- `/private/*` — Routes that require authentication.

Example:
- GET `/public/healthz` — Liveness probe.
- GET `/private/labs/transactions` — Returns `Transaction[]` for the authenticated user.

Middlewares: [requestIdMiddleware](requestIdMiddleware.md), [loggerMiddleware](loggerMiddleware.md)
Errors: normalized via `toHttpErrorResponse` from `@o3osatoshi/toolkit`. Zod
validation failures are handled by [respondZodError](respondZodError.md).

## Parameters

### deps

[`Deps`](../type-aliases/Deps.md)

Implementations of [Deps](../type-aliases/Deps.md).

## Returns

`Hono`\<\{ \}, \{ `/api/*`: \{ \}; \} \| `MergeSchemaPath`\<\{ `/*`: \{ \}; \}, `"/api/auth"`\> \| `MergeSchemaPath`\<\{ `/healthz`: \{ `$get`: \{ `input`: \{ \}; `output`: \{ `ok`: `true`; \}; `outputFormat`: `"json"`; `status`: `ContentfulStatusCode`; \}; \}; \}, `"/api/public"`\> \| `MergeSchemaPath`\<`object` & `object`, `"/api/private"`\>, `"/api"`\>

Configured Hono app instance.
