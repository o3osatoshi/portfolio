[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / baseTestPreset

# Function: baseTestPreset()

> **baseTestPreset**(`opts`): `UserConfig`

Defined in: [packages/config/src/vitest/index.ts:18](https://github.com/o3osatoshi/experiment/blob/54ab00df974a3e9f8283fbcd8c611ed1e0274132/packages/config/src/vitest/index.ts#L18)

Creates the shared Vitest configuration for workspace packages with consistent reporting defaults.

## Parameters

### opts

`InlineConfig` = `{}`

Inline overrides for coverage behaviour or output locations.

## Returns

`UserConfig`

Vitest configuration produced via `defineConfig`.

## Remarks

Coverage defaults to the `v8` provider and remains disabled unless `opts.coverage?.enabled` is set.
Core exclusions are enforced, with any additional `opts.coverage?.exclude` entries appended, and
reports write to `.reports/coverage` unless overridden. A JUnit report is emitted to
`.reports/junit.xml` by default; provide `opts.outputFile` to change the destination. Currently only
the coverage-related fields and `outputFile` from `opts` are honored.
