[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / ClientOptions

# Type Alias: ClientOptions

> **ClientOptions** = `ClientRequestOptions`

Defined in: [packages/interface/src/rpc-client/client.ts:13](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/interface/src/rpc-client/client.ts#L13)

Options forwarded to the underlying Hono RPC client.

Useful for injecting a custom `fetch` implementation, default headers
(e.g. auth cookies), or `RequestInit` overrides.
