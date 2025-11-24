[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / withAuth

# Function: withAuth()

> **withAuth**(`init`, `auth?`): `RequestInit`

Defined in: [packages/interface/src/rpc-client/auth.ts:24](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/interface/src/rpc-client/auth.ts#L24)

Apply authentication headers to a `RequestInit` object.

Existing headers in `init` are preserved and augmented.
When `auth` is `undefined` or `{ type: "none" }`, the original
`RequestInit` is returned as-is.

## Parameters

### init

`RequestInit` = `{}`

Base `RequestInit` to augment.

### auth?

[`AuthConfig`](../type-aliases/AuthConfig.md)

Optional [AuthConfig](../type-aliases/AuthConfig.md) describing how to authenticate.

## Returns

`RequestInit`

A new `RequestInit` with appropriate auth headers applied.
