[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / EnvSchema

# Type Alias: EnvSchema

> **EnvSchema** = `Record`\<`string`, `z.ZodTypeAny`\>

Defined in: [env.ts:39](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/env.ts#L39)

A map of environment variable names to their Zod validators.
Keys correspond to the exact variable names in `process.env`.
Unknown variables are ignored; only declared keys are validated and returned.
