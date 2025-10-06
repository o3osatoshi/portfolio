[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / Options

# Type Alias: Options

> **Options** = `object` & `InlineConfig`

Defined in: [packages/config/src/vitest/index.ts:12](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/config/src/vitest/index.ts#L12)

Supported overrides for the shared Vitest presets.

Combines `InlineConfig` so consumers can forward common Vitest options while exposing a
`plugins` property mirroring `ViteUserConfig["plugins"]` for Vite/Vitest plugin registration.

## Type Declaration

### plugins?

> `optional` **plugins**: `ViteUserConfig`\[`"plugins"`\]
