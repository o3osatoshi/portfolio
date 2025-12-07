[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / parseWith

# Function: parseWith()

> **parseWith**\<`T`\>(`schema`, `ctx`): (`input`) => `Result`\<`output`\<`T`\>, `Error`\>

Defined in: [zod/zod-parse.ts:55](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/zod/zod-parse.ts#L55)

Creates a synchronous Result-returning parser from a Zod schema.

- Uses `schema.parse`, allowing Zod to throw on validation errors.
- Normalises thrown errors through [newZodError](newZodError.md) with the supplied context.

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

A function that yields a neverthrow Result containing the inferred schema output.

> (`input`): `Result`\<`output`\<`T`\>, `Error`\>

### Parameters

#### input

`unknown`

### Returns

`Result`\<`output`\<`T`\>, `Error`\>

## Example

```ts
const parseUser = parseWith(userSchema, { action: "ParseUser", layer: "UI" });
const res = parseUser(someInput);
// Result of parsed type
```
