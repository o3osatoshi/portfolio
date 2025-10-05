[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / browserTestPreset

# Function: browserTestPreset()

> **browserTestPreset**(`opts`): `UserConfig`

Defined in: [packages/config/src/vitest/index.ts:53](https://github.com/o3osatoshi/experiment/blob/54ab00df974a3e9f8283fbcd8c611ed1e0274132/packages/config/src/vitest/index.ts#L53)

Creates a browser-oriented Vitest configuration with CSS support and shared setup defaults.

## Parameters

### opts

`InlineConfig` = `{}`

Inline overrides for coverage behaviour, CSS handling, or setup files.

## Returns

`UserConfig`

Vitest configuration produced via `defineConfig`.

## Remarks

Mirrors the shared coverage configuration from [baseTestPreset](baseTestPreset.md), defaulting to the `v8` provider
and staying disabled unless `opts.coverage?.enabled` is truthy. CSS processing is enabled unless
explicitly turned off through `opts.css`. The setup sequence prepends `./src/test/setupTests.ts`
(relative to the consuming package) before any `opts.setupFiles` entries, so browser utilities like
DOM polyfills load consistently.
