[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / resolveAbortSignal

# Function: resolveAbortSignal()

> **resolveAbortSignal**(`options`): [`ResolvedAbortSignal`](../type-aliases/ResolvedAbortSignal.md)

Defined in: [packages/toolkit/src/asynchronous/resolve-abort-signal.ts:48](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/resolve-abort-signal.ts#L48)

Combine an optional upstream signal with an optional timeout budget.

When `timeoutMs` is provided, a new `AbortController` is created and aborted
on timeout. When `signal` is provided, the returned signal will follow it.

## Parameters

### options

[`ResolveAbortSignalOptions`](../type-aliases/ResolveAbortSignalOptions.md) = `{}`

Abort signal configuration.

## Returns

[`ResolvedAbortSignal`](../type-aliases/ResolvedAbortSignal.md)

Derived signal with a cleanup hook.
