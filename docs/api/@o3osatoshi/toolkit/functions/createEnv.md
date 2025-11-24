[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / createEnv

# Function: createEnv()

> **createEnv**\<`T`\>(`schema`, `opts`): [`EnvOf`](../type-aliases/EnvOf.md)\<`T`\>

Defined in: [env.ts:71](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/env.ts#L71)

Validates environment variables with Zod and returns a fully typed object.

- Reads from `opts.source` when provided, otherwise `process.env`.
- Only keys declared in `schema` are returned; others are ignored.
- Throws a descriptive `Error` when validation fails, including all issues.

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

A typed object whose values are inferred from the given schemas.

## Throws

Error - When validation fails; message lists each invalid field.

## Examples

// Basic usage with defaults
```ts
const env = createEnv({ PORT: z.coerce.number().int().positive().default(3000) });
```

// Add a label for clearer errors and pass a custom source (e.g. tests)
```ts
const env = createEnv(
  { API_URL: z.url() },
  { name: "web", source: { API_URL: "https://example.com" } },
);
```
