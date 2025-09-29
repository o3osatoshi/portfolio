[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / parseWith

# Function: parseWith()

> **parseWith**\<`T`\>(`schema`, `ctx`): (`input`) => `Result`\<`output`\<`T`\>, `Error`\>

Defined in: [zod-parse.ts:50](https://github.com/o3osatoshi/experiment/blob/04dfa58df6e48824a200a24d77afef7ce464e1ae/packages/toolkit/src/zod-parse.ts#L50)

Create a Result-returning parser from a Zod schema.

- Uses `schema.parse` (sync). If validation fails, Zod throws.
- Thrown errors are normalized via `newZodError` using the provided `action`/`layer`.

## Type Parameters

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

extends ZodTypeAny

## Parameters

### schema

`T`

Zod schema to validate/transform the input.

### ctx

Context for standardized error shaping.

#### action

`string`

Logical operation name (e.g. "ParseCreateTransactionRequest").

#### layer?

[`Layer`](../type-aliases/Layer.md)

Error layer; defaults to Application inside `newZodError`.

## Returns

Function that parses input into `Result<z.infer<T>, Error>`.

> (`input`): `Result`\<`output`\<`T`\>, `Error`\>

### Parameters

#### input

`unknown`

### Returns

`Result`\<`output`\<`T`\>, `Error`\>

## Example

```ts
const parseUser = parseWith(userSchema, { action: "ParseUser", layer: "UI" });
const res = parseUser({ name: "alice" }); // Result<User, Error>
```
