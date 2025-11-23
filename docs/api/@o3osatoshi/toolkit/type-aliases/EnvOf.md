[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / EnvOf

# Type Alias: EnvOf\<T\>

> **EnvOf**\<`T`\> = `{ [K in keyof T]: z.infer<T[K]> }`

Defined in: [env.ts:28](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/env.ts#L28)

Utility type that maps an [EnvSchema](EnvSchema.md) to the inferred runtime types
produced by each Zod validator.

## Type Parameters

### T

`T` *extends* [`EnvSchema`](EnvSchema.md)

A map of environment variable names to Zod schemas.
