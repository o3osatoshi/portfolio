[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / parseAsyncWith

# Function: parseAsyncWith()

> **parseAsyncWith**\<`T`\>(`schema`, `ctx`): (`input`) => `ResultAsync`\<`output`\<`T`\>, `Error`\>

Defined in: [zod-parse.ts:22](https://github.com/o3osatoshi/experiment/blob/04dfa58df6e48824a200a24d77afef7ce464e1ae/packages/toolkit/src/zod-parse.ts#L22)

Create an async Result-returning parser from a Zod schema.

- Uses `schema.parseAsync` for async refinements/validations.
- Rejections are normalized via `newZodError` using the provided `action`/`layer`.

## Type Parameters

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

extends ZodTypeAny

## Parameters

### schema

`T`

Zod schema to validate/transform input asynchronously.

### ctx

Context for standardized error shaping.

#### action

`string`

Logical operation name (e.g. "ParseToken").

#### layer?

[`Layer`](../type-aliases/Layer.md)

Error layer; defaults to Application inside `newZodError`.

## Returns

Function that parses input into `ResultAsync<z.infer<T>, Error>`.

> (`input`): `ResultAsync`\<`output`\<`T`\>, `Error`\>

### Parameters

#### input

`unknown`

### Returns

`ResultAsync`\<`output`\<`T`\>, `Error`\>

## Example

```ts
const parseToken = parseAsyncWith(tokenSchema, { action: "ParseToken", layer: "Auth" });
const res = await parseToken({ token: "ok" }); // ResultAsync<Token, Error>
```
