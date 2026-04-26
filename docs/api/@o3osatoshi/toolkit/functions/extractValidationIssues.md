[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / extractValidationIssues

# Function: extractValidationIssues()

> **extractValidationIssues**(`error`): [`ValidationIssue`](../type-aliases/ValidationIssue.md)[]

Defined in: [packages/toolkit/src/zod/zod-error.ts:80](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/zod/zod-error.ts#L80)

Extracts compact validation issues previously attached to `error.meta.validationIssues`.

## Parameters

### error

[`RichError`](../classes/RichError.md)

RichError that may carry compact validation issues in `meta`.

## Returns

[`ValidationIssue`](../type-aliases/ValidationIssue.md)[]

Normalized validation issues safe for debug rendering.

## Remarks

This is intended to read the payload produced by [newZodError](newZodError.md) when
`includeValidationIssues` is enabled. Invalid or non-array metadata is ignored.
