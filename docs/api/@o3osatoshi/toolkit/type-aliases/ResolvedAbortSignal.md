[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / ResolvedAbortSignal

# Type Alias: ResolvedAbortSignal

> **ResolvedAbortSignal** = `object`

Defined in: [packages/toolkit/src/asynchronous/resolve-abort-signal.ts:27](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/resolve-abort-signal.ts#L27)

Result produced by [resolveAbortSignal](../functions/resolveAbortSignal.md).

## Properties

### cleanup()

> **cleanup**: () => `void`

Defined in: [packages/toolkit/src/asynchronous/resolve-abort-signal.ts:31](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/resolve-abort-signal.ts#L31)

Cleanup function to clear timeouts and listeners.

#### Returns

`void`

***

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [packages/toolkit/src/asynchronous/resolve-abort-signal.ts:35](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/resolve-abort-signal.ts#L35)

Derived signal that can be passed to async operations.
