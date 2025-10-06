[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / NewZodError

# Type Alias: NewZodError

> **NewZodError** = `object`

Defined in: [zod-error.ts:25](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/zod-error.ts#L25)

Options accepted by [newZodError](../functions/newZodError.md) when normalizing validation issues.
Designed to mirror [NewError](NewError.md) while providing Zod-specific hooks.

## Properties

### action?

> `optional` **action**: `string`

Defined in: [zod-error.ts:27](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/zod-error.ts#L27)

Logical operation being validated when the failure occurred.

***

### cause?

> `optional` **cause**: `unknown`

Defined in: [zod-error.ts:32](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/zod-error.ts#L32)

Original throwable (ideally a `ZodError`) used to derive issues.
Defaults to `undefined` when a raw issue list is supplied via the `issues` option.

***

### hint?

> `optional` **hint**: `string`

Defined in: [zod-error.ts:34](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/zod-error.ts#L34)

Suggested remediation; falls back to an inferred hint when omitted.

***

### impact?

> `optional` **impact**: `string`

Defined in: [zod-error.ts:36](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/zod-error.ts#L36)

Description of the effect of the validation failure.

***

### issues?

> `optional` **issues**: `ZodIssue`[]

Defined in: [zod-error.ts:38](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/zod-error.ts#L38)

Explicit Zod issues list; inferred from the `cause` when absent.

***

### layer?

> `optional` **layer**: [`Layer`](Layer.md)

Defined in: [zod-error.ts:40](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/zod-error.ts#L40)

Architectural layer responsible for validation (default `"Application"`).
