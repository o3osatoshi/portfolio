[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / baseTestPreset

# Function: baseTestPreset()

> **baseTestPreset**(`opts`): `UserConfig`

Defined in: [packages/config/src/vitest/index.ts:34](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/config/src/vitest/index.ts#L34)

Creates the shared Vitest configuration for workspace packages with consistent reporting defaults.

## Parameters

### opts

[`Options`](../type-aliases/Options.md) = `{}`

Inline overrides for coverage behaviour, plugin registration, or report locations.

## Returns

`UserConfig`

Vitest configuration produced via `defineConfig`.

## Remarks

Applies workspace defaults for coverage and reporting while allowing consumers to forward
frequently customised [InlineConfig](https://vitest.dev/config) fields.
- Coverage defaults to the `v8` provider and remains disabled unless `opts.coverage?.enabled` is set.
- Core exclusions are enforced, with any additional `opts.coverage?.exclude` entries appended, and
  reports write to `.reports/coverage` unless overridden.
- Provide `opts.outputFile` to change the default JUnit destination (`.reports/junit.xml`).
- Any `opts.plugins` array is passed directly to `defineConfig` for additional Vite/Vitest plugins.
Fields beyond those listed above currently have no effect but remain type-compatible through
[Options](../type-aliases/Options.md).
