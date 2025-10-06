[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / NewError

# Type Alias: NewError

> **NewError** = `object`

Defined in: [error.ts:7](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/error.ts#L7)

Structured descriptor passed into [newError](../functions/newError.md), exported for consumers
that want to build wrappers or share strongly typed error payloads.

## Properties

### action?

> `optional` **action**: `string`

Defined in: [error.ts:9](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/error.ts#L9)

Logical operation being performed when the error occurred.

***

### cause?

> `optional` **cause**: `unknown`

Defined in: [error.ts:11](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/error.ts#L11)

Original cause (any type) captured for diagnostic context.

***

### hint?

> `optional` **hint**: `string`

Defined in: [error.ts:13](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/error.ts#L13)

Suggested follow-up or remediation for the caller.

***

### impact?

> `optional` **impact**: `string`

Defined in: [error.ts:15](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/error.ts#L15)

Description of the resulting effect or blast radius.

***

### kind

> **kind**: `Kind`

Defined in: [error.ts:17](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/error.ts#L17)

High-level error classification shared across layers.

***

### layer

> **layer**: `Layer`

Defined in: [error.ts:19](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/error.ts#L19)

Architectural layer where the failure originated.

***

### reason?

> `optional` **reason**: `string`

Defined in: [error.ts:21](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/toolkit/src/error.ts#L21)

Short explanation of why the operation failed.
