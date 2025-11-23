[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / SleepOptions

# Type Alias: SleepOptions

> **SleepOptions** = `object`

Defined in: [asynchronous.ts:10](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/asynchronous.ts#L10)

Options accepted by [sleep](../functions/sleep.md).

## Properties

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [asynchronous.ts:16](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/toolkit/src/asynchronous.ts#L16)

Optional signal used to cancel the pending timeout before it resolves.
Pass `AbortController.signal` to interrupt the sleep and receive an
`InfraCanceledError`.
