[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / Options

# Type Alias: Options

> **Options** = `object`

Defined in: [packages/config/src/vitest/index.ts:19](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/config/src/vitest/index.ts#L19)

Supported overrides for the shared Vitest presets.

Provides a thin wrapper allowing consumers to forward a `test` InlineConfig from `vitest/node` alongside
optional Vite/Vitest plugins exposed via `ViteUserConfig["plugins"]` and Vite resolve settings via
`ViteUserConfig["resolve"]`.

## Properties

### plugins?

> `optional` **plugins**: `ViteUserConfig`\[`"plugins"`\]

Defined in: [packages/config/src/vitest/index.ts:20](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/config/src/vitest/index.ts#L20)

***

### resolve?

> `optional` **resolve**: `ViteUserConfig`["resolve"]

Defined in: [packages/config/src/vitest/index.ts:21](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/config/src/vitest/index.ts#L21)

***

### test?

> `optional` **test**: `object` & `InlineConfig`

Defined in: [packages/config/src/vitest/index.ts:22](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/config/src/vitest/index.ts#L22)

#### Type Declaration

##### coverage?

> `optional` **coverage**: `CoverageV8Options`
