[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / CreateEnvOptions

# Type Alias: CreateEnvOptions

> **CreateEnvOptions** = `object`

Defined in: [env.ts:8](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/env.ts#L8)

Options for [createEnv](../functions/createEnv.md).

## Properties

### name?

> `optional` **name**: `string`

Defined in: [env.ts:13](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/env.ts#L13)

Optional label used in error messages for clarity, e.g. "web" →
`Invalid web env: ...`. If omitted, messages use just `env`.

***

### source?

> `optional` **source**: `Record`\<`string`, `string` \| `undefined`\>

Defined in: [env.ts:18](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/env.ts#L18)

Optional source object to read from. Defaults to `process.env`.
Useful for testing or SSR environments where a custom map is preferred.
