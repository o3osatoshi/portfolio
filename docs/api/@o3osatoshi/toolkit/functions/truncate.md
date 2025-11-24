[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / truncate

# Function: truncate()

> **truncate**(`value`, `maxLen?`): `string`

Defined in: [truncate.ts:22](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/truncate.ts#L22)

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

`null` | `number`

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
