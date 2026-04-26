[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / CreateEnvOptions

# Type Alias: CreateEnvOptions

> **CreateEnvOptions** = `object`

Defined in: [packages/toolkit/src/env.ts:10](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/env.ts#L10)

Options for [createEnv](../functions/createEnv.md).

## Properties

### name?

> `optional` **name**: `string`

Defined in: [packages/toolkit/src/env.ts:15](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/env.ts#L15)

Optional label used in error messages for clarity, e.g. "web" →
`Invalid web env: ...`. If omitted, messages use just `env`.

***

### source?

> `optional` **source**: `Record`\<`string`, `string` \| `undefined`\>

Defined in: [packages/toolkit/src/env.ts:20](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/env.ts#L20)

Optional source object to read from. Defaults to `process.env`.
Useful for testing or SSR environments where a custom map is preferred.
