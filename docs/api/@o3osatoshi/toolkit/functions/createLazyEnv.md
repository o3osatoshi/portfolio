[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / createLazyEnv

# Function: createLazyEnv()

> **createLazyEnv**\<`T`\>(`schema`, `opts`): [`EnvOf`](../type-aliases/EnvOf.md)\<`T`\>

Defined in: [packages/toolkit/src/env.ts:116](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/env.ts#L116)

Lazily validates environment variables on first property access.

This helper is useful when environment validation should only occur at
runtime (e.g. inside serverless handlers or route handlers) instead of at
module evaluation time.

The underlying [createEnv](createEnv.md) result is cached after the first access.
The returned proxy is effectively read-only: attempts to define, update, or
delete properties will fail (throw in strict mode or be ignored in
non-strict mode), and only the properties defined by the schema are
guaranteed to be readable.

## Type Parameters

### T

`T` *extends* [`EnvSchema`](../type-aliases/EnvSchema.md)

The [EnvSchema](../type-aliases/EnvSchema.md) describing expected variables.

## Parameters

### schema

`T`

Map of variable names to Zod validators.

### opts

[`CreateEnvOptions`](../type-aliases/CreateEnvOptions.md) = `{}`

Optional settings to customize source and error labeling.

## Returns

[`EnvOf`](../type-aliases/EnvOf.md)\<`T`\>

A proxied object that resolves properties against the validated env.
