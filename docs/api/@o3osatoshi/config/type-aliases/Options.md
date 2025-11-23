[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / Options

# Type Alias: Options

> **Options** = `object`

Defined in: [packages/config/src/vitest/index.ts:17](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/config/src/vitest/index.ts#L17)

Supported overrides for the shared Vitest presets.

Provides a thin wrapper allowing consumers to forward a `test` InlineConfig from `vitest/node` alongside
optional Vite/Vitest plugins exposed via `ViteUserConfig["plugins"]`.

## Properties

### plugins?

> `optional` **plugins**: `ViteUserConfig`\[`"plugins"`\]

Defined in: [packages/config/src/vitest/index.ts:18](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/config/src/vitest/index.ts#L18)

***

### test?

> `optional` **test**: `InlineConfig`

Defined in: [packages/config/src/vitest/index.ts:19](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/config/src/vitest/index.ts#L19)
