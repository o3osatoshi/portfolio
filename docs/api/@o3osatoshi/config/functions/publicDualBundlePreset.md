[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / publicDualBundlePreset

# Function: publicDualBundlePreset()

> **publicDualBundlePreset**(`opts`): `Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>

Defined in: [packages/config/src/tsup/index.ts:98](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/config/src/tsup/index.ts#L98)

Creates a tsup configuration preset for public libraries that need dual ESM/CJS outputs.

## Parameters

### opts

`Options` = `{}`

Additional tsup options to override the preset defaults.

## Returns

`Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>

Resolved configuration object that can be passed directly to the tsup CLI.

## Remarks

- Produces both ESM and CJS bundles alongside TypeScript declaration files.
- Disables sourcemaps during local development for speed, enabling them in CI/production.
- Automatically externalizes runtime and peer dependencies to avoid duplicate bundling.
