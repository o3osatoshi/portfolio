[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / browserTestPreset

# Function: browserTestPreset()

> **browserTestPreset**(`opts`): `UserConfig`

Defined in: [packages/config/src/vitest/index.ts:94](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/config/src/vitest/index.ts#L94)

Creates a browser-oriented Vitest configuration with CSS support and shared setup defaults.

## Parameters

### opts

[`Options`](../type-aliases/Options.md) = `{}`

Optional InlineConfig details and plugin registrations to merge into the preset.

## Returns

`UserConfig`

Vitest configuration produced via `defineConfig`.

## Remarks

Shares the merge behaviour of [baseTestPreset](baseTestPreset.md) while tailoring defaults for browser tests.
- Spreads `opts.test` first, then reapplies the shared defaults so coverage, environment, and CSS
  handling stay aligned across packages.
- Coverage falls back to the same `v8`-based defaults unless `opts.test?.coverage` is supplied. When
  overriding coverage, include every field you need because the preset rebuilds the object.
- CSS handling is enabled (`true`) by default and can be disabled by setting `opts.test?.css`.
- The environment defaults to `jsdom`, though any fields supplied via `opts.test` override the
  preset after defaults are applied.
- Additional Vite/Vitest plugins can be registered through `opts.plugins`.
- Vite resolve settings can be forwarded through `opts.resolve` (aliases, extensions, etc.).
