[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / createRpcClient

# Function: createRpcClient()

> **createRpcClient**(`baseURL`, `options?`): `object` & `object` & `object` & `object` & `object`

Defined in: [packages/interface/src/rpc-client/client.ts:38](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/rpc-client/client.ts#L38)

Create a typed RPC client for the interface HTTP API.

The returned client matches the server routes defined by [AppType](../type-aliases/AppType.md)
(e.g. `client.api.public.healthz.$get()`).

## Parameters

### baseURL

`string`

Base URL of the deployed interface API.

### options?

[`ClientOptions`](../type-aliases/ClientOptions.md)

Optional Hono client options (headers, fetch, init).

## Returns

`object` & `object` & `object` & `object` & `object`

Hono RPC client bound to [AppType](../type-aliases/AppType.md).
