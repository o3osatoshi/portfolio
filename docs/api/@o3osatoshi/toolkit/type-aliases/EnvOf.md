[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / EnvOf

# Type Alias: EnvOf\<T\>

> **EnvOf**\<`T`\> = `{ [K in keyof T]: z.infer<T[K]> }`

Defined in: [env.ts:28](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/env.ts#L28)

Utility type that maps an [EnvSchema](EnvSchema.md) to the inferred runtime types
produced by each Zod validator.

## Type Parameters

### T

`T` *extends* [`EnvSchema`](EnvSchema.md)

A map of environment variable names to Zod schemas.
