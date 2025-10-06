[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / parseAsyncWith

# Function: parseAsyncWith()

> **parseAsyncWith**\<`T`\>(`schema`, `ctx`): (`input`) => `ResultAsync`\<`output`\<`T`\>, `Error`\>

Defined in: [zod-parse.ts:21](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/zod-parse.ts#L21)

Creates an async Result-returning parser from a Zod schema.

- Uses `schema.parseAsync` to respect asynchronous refinements.
- Normalises failures through [newZodError](newZodError.md) with the supplied context.

## Type Parameters

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Zod schema type inferred from the provided `schema`.

## Parameters

### schema

`T`

Zod schema used to validate or transform incoming data.

### ctx

Context describing the logical action and optional layer override.

#### action

`string`

#### layer?

[`Layer`](../type-aliases/Layer.md)

## Returns

A function that yields a neverthrow `ResultAsync` containing the inferred schema output.

> (`input`): `ResultAsync`\<`output`\<`T`\>, `Error`\>

### Parameters

#### input

`unknown`

### Returns

`ResultAsync`\<`output`\<`T`\>, `Error`\>

## Example

```ts
const parseToken = parseAsyncWith(tokenSchema, { action: "ParseToken", layer: "Auth" });
const res = await parseToken({ token: "ok" }); // `ResultAsync<Token, Error\>`
@public
```
