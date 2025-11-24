[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / AuthConfig

# Type Alias: AuthConfig

> **AuthConfig** = \{ `cookie`: `string`; `type`: `"cookie"`; \} \| \{ `token`: `string`; `type`: `"bearer"`; \} \| \{ `type`: `"none"`; \}

Defined in: [packages/interface/src/rpc-client/auth.ts:8](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/interface/src/rpc-client/auth.ts#L8)

Authentication configuration for HTTP requests.

- `bearer`: Adds an `Authorization: Bearer <token>` header.
- `cookie`: Adds a `Cookie` header as provided.
- `none`: Leaves the request unchanged.
