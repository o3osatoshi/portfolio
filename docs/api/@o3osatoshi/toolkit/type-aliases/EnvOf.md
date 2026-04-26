[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / EnvOf

# Type Alias: EnvOf\<T\>

> **EnvOf**\<`T`\> = `{ [K in keyof T]: z.infer<T[K]> }`

Defined in: [packages/toolkit/src/env.ts:37](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/env.ts#L37)

Utility type that maps an [EnvSchema](EnvSchema.md) to the inferred runtime types
produced by each Zod validator.

## Type Parameters

### T

`T` *extends* [`EnvSchema`](EnvSchema.md)

A map of environment variable names to Zod schemas.
