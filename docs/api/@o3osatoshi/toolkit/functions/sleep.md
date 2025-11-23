[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / sleep

# Function: sleep()

> **sleep**(`ms`, `options`): `ResultAsync`\<`void`, `Error`\>

Defined in: [asynchronous.ts:32](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/asynchronous.ts#L32)

Delay execution for a given duration with AbortSignal support.

Designed as an infrastructure utility that keeps timing logic near the runtime.
Rejects with an `InfraCanceledError` when the provided signal aborts before the
timeout completes.

## Parameters

### ms

`number`

Milliseconds to wait before resolving.

### options

[`SleepOptions`](../type-aliases/SleepOptions.md) = `{}`

Optional abort configuration; pass `AbortController.signal`.

## Returns

`ResultAsync`\<`void`, `Error`\>

ResultAsync that resolves after `ms` milliseconds or yields an error
         when aborted.
