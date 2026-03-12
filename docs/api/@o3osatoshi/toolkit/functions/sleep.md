[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / sleep

# Function: sleep()

> **sleep**(`ms`, `options`): `ResultAsync`\<`void`, [`RichError`](../classes/RichError.md)\>

Defined in: [packages/toolkit/src/asynchronous/sleep.ts:32](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/asynchronous/sleep.ts#L32)

Delay execution for a given duration with AbortSignal support.

Designed as an infrastructure utility that keeps timing logic near the runtime.
Rejects with an `InfrastructureCanceledError` when the provided signal aborts before the
timeout completes.

## Parameters

### ms

`number`

Milliseconds to wait before resolving.

### options

[`SleepOptions`](../type-aliases/SleepOptions.md) = `{}`

Optional abort configuration; pass `AbortController.signal`.

## Returns

`ResultAsync`\<`void`, [`RichError`](../classes/RichError.md)\>

ResultAsync that resolves after `ms` milliseconds or yields an error
         when aborted.
