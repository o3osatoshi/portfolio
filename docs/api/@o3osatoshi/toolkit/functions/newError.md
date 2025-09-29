[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / newError

# Function: newError()

> **newError**(`__namedParameters`): `Error`

Defined in: [error.ts:94](https://github.com/o3osatoshi/experiment/blob/f1d231870a1d13a36a9ead236d22edc1fb9797dd/packages/toolkit/src/error.ts#L94)

Creates a structured Error object with a consistent `name` and `message`.
Intended for use in Domain/Application/Infra/Auth/UI layers where you want
more context than a plain `new Error(...)`.

## Error name
- Computed as `<Layer><Kind>Error` (e.g. `DomainValidationError`).
- Useful for quick classification or HTTP mapping.

## Error message
- Built from the provided `action`, `reason`, `impact`, `hint`, and a
  summarized version of the original `cause` (if any).
- Order: action → reason → impact → hint → cause.
- Example: `"UpdateTransaction failed because transaction not found. Impact: no update applied. Hint: verify txId. Cause: DB timeout."`

## Cause handling
- If `cause` is an `Error`, its `.message` is extracted and appended as `Cause: ...`.
- If `cause` is a string, it is used directly.
- If `cause` is any other object, it is JSON stringified when possible.
- Note: the original `cause` is NOT attached to the returned `Error`; it is
  only summarized into the message.

## Recommended usage
- Use `layer` and `kind` to categorize error origin (`Domain`, `Application`, `Infra`, `Auth`, `UI`, `DB`, `External`) and type (`Validation`, `Timeout`, `Unavailable`, `Integrity`, `Deadlock`, `Serialization`, etc.).
- Use `action` to describe what failed (e.g. "UpdateTransaction").
- Use `reason` to explain why (short, technical).
- Use `impact` to describe the consequence.
- Use `hint` to suggest a possible fix or next step.

## Parameters

### \_\_namedParameters

`NewError`

## Returns

`Error`

An Error with enriched `name` and `message`.

## Example

```ts
throw newError({
  layer: "Domain",
  kind: "Validation",
  action: "CreateUser",
  reason: "email format is invalid",
  impact: "user cannot be registered",
  hint: "ensure email has @",
  cause: originalError,
});
```
