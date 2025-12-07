[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / NewError

# Type Alias: NewError

> **NewError** = `object`

Defined in: [error/error.ts:69](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error.ts#L69)

Structured descriptor passed into [newError](../functions/newError.md), exported for consumers
that want to build wrappers or share strongly typed error payloads.

## Properties

### action?

> `optional` **action**: `string`

Defined in: [error/error.ts:71](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error.ts#L71)

Logical operation being performed when the error occurred.

***

### cause?

> `optional` **cause**: `unknown`

Defined in: [error/error.ts:73](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error.ts#L73)

Original cause (any type) captured for diagnostic context.

***

### hint?

> `optional` **hint**: `string`

Defined in: [error/error.ts:75](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error.ts#L75)

Suggested follow-up or remediation for the caller.

***

### impact?

> `optional` **impact**: `string`

Defined in: [error/error.ts:77](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error.ts#L77)

Description of the resulting effect or blast radius.

***

### kind

> **kind**: [`Kind`](Kind.md)

Defined in: [error/error.ts:79](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error.ts#L79)

High-level error classification shared across layers.

***

### layer

> **layer**: [`Layer`](Layer.md)

Defined in: [error/error.ts:81](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error.ts#L81)

Architectural layer where the failure originated.

***

### reason?

> `optional` **reason**: `string`

Defined in: [error/error.ts:83](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/toolkit/src/error/error.ts#L83)

Short explanation of why the operation failed.
