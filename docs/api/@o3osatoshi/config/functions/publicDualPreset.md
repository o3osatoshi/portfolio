[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / publicDualPreset

# Function: publicDualPreset()

> **publicDualPreset**(`opts`): `Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>

Defined in: [packages/config/src/tsup/index.ts:93](https://github.com/o3osatoshi/experiment/blob/04dfa58df6e48824a200a24d77afef7ce464e1ae/packages/config/src/tsup/index.ts#L93)

Generate a tsup configuration for public libraries publishing dual outputs.

- Produces both ESM and CJS bundles alongside TypeScript declaration files.
- Keeps source maps off in development for speed, but enables them in CI/production.
- Externalizes peer and runtime dependencies automatically to avoid double bundling.

## Parameters

### opts

`Options` = `{}`

Additional tsup Options to merge with the preset defaults.

## Returns

`Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>
