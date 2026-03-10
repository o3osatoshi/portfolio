[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / EnvSchema

# Type Alias: EnvSchema

> **EnvSchema** = `Record`\<`string`, `z.ZodTypeAny`\>

Defined in: [packages/toolkit/src/env.ts:48](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/env.ts#L48)

A map of environment variable names to their Zod validators.
Keys correspond to the exact variable names in `process.env`.
Unknown variables are ignored; only declared keys are validated and returned.
