[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / SleepOptions

# Type Alias: SleepOptions

> **SleepOptions** = `object`

Defined in: [asynchronous.ts:10](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/asynchronous.ts#L10)

Options accepted by [sleep](../functions/sleep.md).

## Properties

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [asynchronous.ts:16](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/toolkit/src/asynchronous.ts#L16)

Optional signal used to cancel the pending timeout before it resolves.
Pass `AbortController.signal` to interrupt the sleep and receive an
`InfraCanceledError`.
