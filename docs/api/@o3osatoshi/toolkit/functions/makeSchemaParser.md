[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / makeSchemaParser

# Function: makeSchemaParser()

> **makeSchemaParser**\<`T`\>(`schema`, `ctx`): (`input`) => `Result`\<`output`\<`T`\>, [`RichError`](../classes/RichError.md)\>

Defined in: [packages/toolkit/src/zod/zod-parse.ts:25](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/zod/zod-parse.ts#L25)

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

Context describing action plus optional code/layer/error mapping controls.

#### action

`string`

#### code?

`string`

#### includeValidationIssues?

`boolean`

#### layer?

`"Infrastructure"` \| `"Application"` \| `"Auth"` \| `"Domain"` \| `"External"` \| `"Interface"` \| `"Persistence"` \| `"Presentation"`

#### mapError?

(`error`) => [`RichError`](../classes/RichError.md)

## Returns

A function that yields a neverthrow Result containing the inferred schema output.

> (`input`): `Result`\<`output`\<`T`\>, [`RichError`](../classes/RichError.md)\>

### Parameters

#### input

`unknown`

### Returns

`Result`\<`output`\<`T`\>, [`RichError`](../classes/RichError.md)\>

## Example

```ts
const userParser = makeSchemaParser(userSchema, { action: "ParseUser", layer: "Presentation" });
const res = userParser(someInput);
// Result of parsed type
```
