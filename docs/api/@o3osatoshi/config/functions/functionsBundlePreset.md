[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / functionsBundlePreset

# Function: functionsBundlePreset()

> **functionsBundlePreset**(`opts`): `Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>

Defined in: [packages/config/src/tsup/index.ts:66](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/config/src/tsup/index.ts#L66)

Creates a tsup configuration preset for Firebase Cloud Functions deployments.

## Parameters

### opts

`Options` = `{}`

Additional tsup options to override the preset defaults.

## Returns

`Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>

Resolved configuration object that can be passed directly to the tsup CLI.

## Remarks

- Emits CommonJS output targeting Node 22 and includes sourcemaps for local debugging.
- Automatically externalizes dependencies declared in the nearest package.json to keep bundles slim.
- Bundles project code into a single file to match the Functions runtime expectations.
