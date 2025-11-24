[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / NewZodError

# Type Alias: NewZodError

> **NewZodError** = `object`

Defined in: [zod/zod-error.ts:11](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/zod/zod-error.ts#L11)

Options accepted by [newZodError](../functions/newZodError.md) when normalizing validation issues.
Designed to mirror [NewError](NewError.md) while providing Zod-specific hooks.

## Properties

### action?

> `optional` **action**: `string`

Defined in: [zod/zod-error.ts:13](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/zod/zod-error.ts#L13)

Logical operation being validated when the failure occurred.

***

### cause?

> `optional` **cause**: `unknown`

Defined in: [zod/zod-error.ts:18](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/zod/zod-error.ts#L18)

Original throwable (ideally a `ZodError`) used to derive issues.
Defaults to `undefined` when a raw issue list is supplied via the `issues` option.

***

### hint?

> `optional` **hint**: `string`

Defined in: [zod/zod-error.ts:20](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/zod/zod-error.ts#L20)

Suggested remediation; falls back to an inferred hint when omitted.

***

### impact?

> `optional` **impact**: `string`

Defined in: [zod/zod-error.ts:22](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/zod/zod-error.ts#L22)

Description of the effect of the validation failure.

***

### issues?

> `optional` **issues**: `ZodIssue`[]

Defined in: [zod/zod-error.ts:24](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/zod/zod-error.ts#L24)

Explicit Zod issues list; inferred from the `cause` when absent.

***

### layer?

> `optional` **layer**: [`Layer`](Layer.md)

Defined in: [zod/zod-error.ts:26](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/zod/zod-error.ts#L26)

Architectural layer responsible for validation (default `"Application"`).
