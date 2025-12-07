[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / EnvSchema

# Type Alias: EnvSchema

> **EnvSchema** = `Record`\<`string`, `z.ZodTypeAny`\>

Defined in: [env.ts:39](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/env.ts#L39)

A map of environment variable names to their Zod validators.
Keys correspond to the exact variable names in `process.env`.
Unknown variables are ignored; only declared keys are validated and returned.
