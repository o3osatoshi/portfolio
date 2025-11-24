[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / EdgeDeps

# Type Alias: EdgeDeps

> **EdgeDeps** = \{ `authConfig`: [`AuthConfig`](../../auth/interfaces/AuthConfig.md); `createAuthConfig?`: (`c`) => [`AuthConfig`](../../auth/interfaces/AuthConfig.md); \} \| \{ `authConfig?`: [`AuthConfig`](../../auth/interfaces/AuthConfig.md); `createAuthConfig`: (`c`) => [`AuthConfig`](../../auth/interfaces/AuthConfig.md); \}

Defined in: [packages/interface/src/http/edge/app.ts:24](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/interface/src/http/edge/app.ts#L24)

Dependencies required by [buildEdgeApp](../functions/buildEdgeApp.md).

- `AuthConfig` can be created via `createAuthConfig` from `@repo/auth`.
