[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / buildEdgeApp

# Function: buildEdgeApp()

> **buildEdgeApp**(`deps`): `Hono`\<\{ \}, \{ `/edge/*`: \{ \}; \} \| `MergeSchemaPath`\<\{ `/healthz`: \{ `$get`: \{ `input`: \{ \}; `output`: \{ `ok`: `true`; \}; `outputFormat`: `"json"`; `status`: `ContentfulStatusCode`; \}; \}; \}, `"/edge/public"`\> \| `MergeSchemaPath`\<`object` & `object`, `"/edge/private"`\>, `"/edge"`\>

Defined in: [packages/interface/src/http/edge/app.ts:45](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/http/edge/app.ts#L45)

Build the Edge-ready HTTP application.

Routes (mounted under `/edge`):
- `/public/*` — Routes that do not require authentication.
- `/private/*` — Routes that require authentication.

Example:
- GET `/public/healthz` — Liveness probe.
- GET `/private/me` — Returns the authenticated user info.

Middlewares: [requestIdMiddleware](requestIdMiddleware.md), [loggerMiddleware](loggerMiddleware.md),
`initAuthConfig`, `verifyAuth`.

## Parameters

### deps

[`EdgeDeps`](../type-aliases/EdgeDeps.md)

Implementations of [EdgeDeps](../type-aliases/EdgeDeps.md).

## Returns

`Hono`\<\{ \}, \{ `/edge/*`: \{ \}; \} \| `MergeSchemaPath`\<\{ `/healthz`: \{ `$get`: \{ `input`: \{ \}; `output`: \{ `ok`: `true`; \}; `outputFormat`: `"json"`; `status`: `ContentfulStatusCode`; \}; \}; \}, `"/edge/public"`\> \| `MergeSchemaPath`\<`object` & `object`, `"/edge/private"`\>, `"/edge"`\>

Configured Hono app instance.
