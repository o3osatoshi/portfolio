[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / NewZodError

# Type Alias: NewZodError

> **NewZodError** = `object` & `Omit`\<[`NewRichError`](NewRichError.md), `"details"` \| `"isOperational"` \| `"kind"` \| `"layer"`\>

Defined in: [packages/toolkit/src/zod/zod-error.ts:19](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/zod/zod-error.ts#L19)

Options accepted by [newZodError](../functions/newZodError.md) when normalizing validation issues.
Designed to mirror [NewRichError](NewRichError.md) while providing Zod-specific hooks.

## Type Declaration

### cause?

> `optional` **cause**: `unknown`

Original throwable (ideally a `ZodError`) used to derive issues.

### details?

> `optional` **details**: [`RichErrorDetails`](RichErrorDetails.md)

Optional diagnostic context that will be merged with inferred details.

### includeValidationIssues?

> `optional` **includeValidationIssues**: `boolean`

Whether to attach normalized validation issues in `meta.validationIssues`.
Disabled by default to preserve payload compactness for non-debug flows.

### isOperational?

> `optional` **isOperational**: `boolean`

Optional operationality override (defaults to Validation semantics).

### layer?

> `optional` **layer**: [`Layer`](Layer.md)

Architectural layer responsible for validation (default `"Application"`).
