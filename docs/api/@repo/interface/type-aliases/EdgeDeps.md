[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / EdgeDeps

# Type Alias: EdgeDeps

> **EdgeDeps** = \{ `authConfig`: [`AuthConfig`](../../auth/interfaces/AuthConfig.md); `createAuthConfig?`: (`c`) => [`AuthConfig`](../../auth/interfaces/AuthConfig.md); \} \| \{ `authConfig?`: [`AuthConfig`](../../auth/interfaces/AuthConfig.md); `createAuthConfig`: (`c`) => [`AuthConfig`](../../auth/interfaces/AuthConfig.md); \}

Defined in: [packages/interface/src/http/edge/app.ts:24](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/http/edge/app.ts#L24)

Dependencies required by [buildEdgeApp](../functions/buildEdgeApp.md).

- [AuthConfig](AuthConfig.md) can be created via `createAuthConfig` from `@repo/auth`.
