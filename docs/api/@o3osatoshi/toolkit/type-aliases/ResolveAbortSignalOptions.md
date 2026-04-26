[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / ResolveAbortSignalOptions

# Type Alias: ResolveAbortSignalOptions

> **ResolveAbortSignalOptions** = `object`

Defined in: [packages/toolkit/src/asynchronous/resolve-abort-signal.ts:6](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/resolve-abort-signal.ts#L6)

Options for [resolveAbortSignal](../functions/resolveAbortSignal.md).

## Properties

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [packages/toolkit/src/asynchronous/resolve-abort-signal.ts:10](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/resolve-abort-signal.ts#L10)

Optional upstream abort signal to follow.

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [packages/toolkit/src/asynchronous/resolve-abort-signal.ts:14](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/resolve-abort-signal.ts#L14)

Optional timeout budget in milliseconds.

***

### timeoutReason?

> `optional` **timeoutReason**: `unknown`

Defined in: [packages/toolkit/src/asynchronous/resolve-abort-signal.ts:19](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/resolve-abort-signal.ts#L19)

Optional abort reason used when the timeout elapses.
When omitted, a generic timeout error is used.
