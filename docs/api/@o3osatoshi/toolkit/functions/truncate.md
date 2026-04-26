[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / truncate

# Function: truncate()

> **truncate**(`value`, `maxLen?`): `string`

Defined in: [packages/toolkit/src/truncate.ts:22](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/truncate.ts#L22)

Returns a truncated copy of `value` when it exceeds `maxLen` characters.

Semantics of `maxLen`:
- number: truncate to the specified length.
- undefined: use the default length (200) for truncation.
- null: do not truncate (return the original string).

## Parameters

### value

`string`

Raw string to potentially shorten.

### maxLen?

Maximum allowed length before truncation is applied; `null` disables truncation.

`number` | `null`

## Returns

`string`

Original `value` when within bounds, otherwise `value` shortened to `maxLen`
characters and suffixed with an ellipsis.

## Example

```ts
truncate("hello world", 5);    // => "hello…"
truncate("hello world");       // => defaults to 200, returns original here
truncate("hello world", null); // => no truncation
```
