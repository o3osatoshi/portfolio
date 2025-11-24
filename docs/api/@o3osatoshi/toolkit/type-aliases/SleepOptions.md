[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / SleepOptions

# Type Alias: SleepOptions

> **SleepOptions** = `object`

Defined in: [asynchronous.ts:10](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/asynchronous.ts#L10)

Options accepted by [sleep](../functions/sleep.md).

## Properties

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [asynchronous.ts:16](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/toolkit/src/asynchronous.ts#L16)

Optional signal used to cancel the pending timeout before it resolves.
Pass `AbortController.signal` to interrupt the sleep and receive an
`InfraCanceledError`.
