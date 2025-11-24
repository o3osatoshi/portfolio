[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / respondZodError

# Function: respondZodError()

> **respondZodError**(`result`, `c`): `undefined` \| `Response`

Defined in: [packages/interface/src/http/core/respond.ts:72](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/interface/src/http/core/respond.ts#L72)

zValidator hook that maps Zod validation failures to normalized JSON errors.

Usage with Hono + @hono/zod-validator:
- Provide this as the 3rd argument to `zValidator`.
- On `result.success === false` it returns a JSON response built from
  `toHttpErrorResponse(newZodError({ cause: result.error }))`.
- When validation succeeds, it returns `undefined` to continue the pipeline.

## Parameters

### result

Result passed by `zValidator` containing success flag and optional ZodError.

#### error?

`unknown`

#### success

`boolean`

### c

`Context`

Hono context used to create the JSON response.

## Returns

`undefined` \| `Response`

A JSON `Response` when validation fails, otherwise `undefined` to
allow request processing to continue.

## Example

```ts
app.get(
  "/route",
  zValidator("query", schema, respondZodError),
  (c) => c.json({ ok: true }),
);
```
