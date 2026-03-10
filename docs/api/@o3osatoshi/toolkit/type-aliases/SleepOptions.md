[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / SleepOptions

# Type Alias: SleepOptions

> **SleepOptions** = `object`

Defined in: [packages/toolkit/src/asynchronous/sleep.ts:10](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/sleep.ts#L10)

Options accepted by [sleep](../functions/sleep.md).

## Properties

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [packages/toolkit/src/asynchronous/sleep.ts:16](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/sleep.ts#L16)

Optional signal used to cancel the pending timeout before it resolves.
Pass `AbortController.signal` to interrupt the sleep and receive an
`InfrastructureCanceledError`.
