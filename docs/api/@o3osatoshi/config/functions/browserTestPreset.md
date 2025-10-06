[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / browserTestPreset

# Function: browserTestPreset()

> **browserTestPreset**(`opts`): `UserConfig`

Defined in: [packages/config/src/vitest/index.ts:73](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/config/src/vitest/index.ts#L73)

Creates a browser-oriented Vitest configuration with CSS support and shared setup defaults.

## Parameters

### opts

[`Options`](../type-aliases/Options.md) = `{}`

Inline overrides for coverage behaviour, CSS handling, setup files, or plugins.

## Returns

`UserConfig`

Vitest configuration produced via `defineConfig`.

## Remarks

Mirrors the shared coverage configuration from [baseTestPreset](baseTestPreset.md), defaulting to the `v8` provider
and staying disabled unless `opts.coverage?.enabled` is truthy. Additional behaviour:
- CSS processing is enabled unless explicitly turned off through `opts.css`.
- Any `opts.setupFiles` value is forwarded directly so packages fully control their setup pipeline.
- Any `opts.plugins` array is forwarded to `defineConfig` to register extra Vite/Vitest plugins.
As with the base preset, other [Options](../type-aliases/Options.md) fields are currently ignored.
