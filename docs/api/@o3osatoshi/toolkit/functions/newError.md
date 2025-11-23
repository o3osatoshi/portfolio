[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / newError

# Function: newError()

> **newError**(`params`): `Error`

Defined in: [error/error.ts:143](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/error/error.ts#L143)

Creates a structured Error object with a consistent `name` and `message`.
Intended for use in Domain/Application/Infra/Auth/UI layers where you want
more context than a plain `new Error(...)`.

## Error name
- Computed as `Layer + Kind + "Error"` (for example `DomainValidationError`).
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
- The original `cause` is also attached to the returned `Error` using native
  `ErrorOptions` when available or a non‑enumerable `cause` property as a
  fallback, so downstream code can inspect `err.cause`.

## Recommended usage
- Use `layer` and `kind` to categorize error origin (`Domain`, `Application`, `Infra`, `Auth`, `UI`, `DB`, `External`) and type (`Validation`, `Timeout`, `Unavailable`, `Integrity`, `Deadlock`, `Serialization`, etc.).
- Use `action` to describe what failed (e.g. "UpdateTransaction").
- Use `reason` to explain why (short, technical).
- Use `impact` to describe the consequence.
- Use `hint` to suggest a possible fix or next step.

## Parameters

### params

[`NewError`](../type-aliases/NewError.md)

Structured descriptor for the error (see [NewError](../type-aliases/NewError.md)).

## Returns

`Error`

An Error with enriched `name` and `message`.

## Remarks

The `params` object accepts the following fields:
- `layer`: Architectural layer where the failure happened (required).
- `kind`: High-level error classification (required).
- `action`: Logical operation being performed.
- `reason`: Short explanation of the failure cause.
- `impact`: Description of the resulting effect.
- `hint`: Suggested follow-up or remediation.
- `cause`: Original error or data that triggered the failure.

## Example

```ts
throw newError(\{
  layer: "Domain",
  kind: "Validation",
  action: "CreateUser",
  reason: "email format is invalid",
  impact: "user cannot be registered",
  hint: "ensure email has @",
  cause: originalError,
\});
```
