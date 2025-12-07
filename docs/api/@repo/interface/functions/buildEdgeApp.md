[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / buildEdgeApp

# Function: buildEdgeApp()

> **buildEdgeApp**(`deps`): `Hono`\<\{ \}, \{ `/edge/*`: \{ \}; \} \| `MergeSchemaPath`\<`object` & `object` & `object`, `"/edge/public"`\> \| `MergeSchemaPath`\<`object` & `object`, `"/edge/private"`\>, `"/edge"`\>

Defined in: [packages/interface/src/http/edge/app.ts:64](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/interface/src/http/edge/app.ts#L64)

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

`Hono`\<\{ \}, \{ `/edge/*`: \{ \}; \} \| `MergeSchemaPath`\<`object` & `object` & `object`, `"/edge/public"`\> \| `MergeSchemaPath`\<`object` & `object`, `"/edge/private"`\>, `"/edge"`\>

Configured Hono app instance.
