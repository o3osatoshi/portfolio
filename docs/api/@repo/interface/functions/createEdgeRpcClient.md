[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / createEdgeRpcClient

# Function: createEdgeRpcClient()

> **createEdgeRpcClient**(`baseURL`, `options?`): `object` & `object` & `object` & `object` & `object` & `object`

Defined in: [packages/interface/src/rpc-client/client.ts:24](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/interface/src/rpc-client/client.ts#L24)

Create a typed RPC client for the Edge HTTP API.

Routes are mounted under `/edge`.

## Parameters

### baseURL

`string`

Base URL of the deployed Edge API.

### options?

[`ClientOptions`](../type-aliases/ClientOptions.md)

Optional Hono client options (headers, fetch, init).

## Returns

`object` & `object` & `object` & `object` & `object` & `object`

Hono RPC client bound to [EdgeAppType](../type-aliases/EdgeAppType.md).
