[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / baseTestPreset

# Function: baseTestPreset()

> **baseTestPreset**(`opts`): `UserConfig`

Defined in: [packages/config/src/vitest/index.ts:47](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/config/src/vitest/index.ts#L47)

Creates the shared Vitest configuration for workspace packages with consistent reporting defaults.

## Parameters

### opts

[`Options`](../type-aliases/Options.md) = `{}`

Optional InlineConfig details and plugin registrations to merge into the preset.

## Returns

`UserConfig`

Vitest configuration produced via `defineConfig`.

## Remarks

Spreads any user-provided InlineConfig through `opts.test` before re-applying the shared defaults for
coverage, environment, and reporting paths so the baseline remains consistent.
- Coverage uses the `v8` provider, stays disabled by default, and emits text-summary, LCOV, and HTML
  reports under `.reports/coverage`. Supply `opts.test?.coverage` to adjust the baseline—because the
  preset rebuilds the coverage object, specify all desired fields when overriding.
- The test environment defaults to `node`, and the JUnit reporter writes to `.reports/junit.xml`
  unless `opts.test?.environment` or `opts.test?.outputFile` override those values.
- Any Vite/Vitest `opts.plugins` values are forwarded directly to `defineConfig`.
- Vite resolve settings can be forwarded through `opts.resolve` (aliases, extensions, etc.).
Additional InlineConfig fields provided via `opts.test` remain untouched unless they collide with the
enforced defaults above.
