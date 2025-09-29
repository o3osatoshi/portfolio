[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / functionsPreset

# Function: functionsPreset()

> **functionsPreset**(`opts`): `Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>

Defined in: [packages/config/src/tsup/index.ts:64](https://github.com/o3osatoshi/experiment/blob/04dfa58df6e48824a200a24d77afef7ce464e1ae/packages/config/src/tsup/index.ts#L64)

Generate a tsup configuration tailored for Firebase Cloud Functions.

- Emits CommonJS output targeting Node 22 with sourcemaps for local debugging.
- Automatically externalizes dependencies declared in package.json to keep
  the deployed artifact slim.
- Bundles project code into a single file to match the Functions runtime
  expectations.

## Parameters

### opts

`Options` = `{}`

Additional tsup Options to merge with the preset defaults.

## Returns

`Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>
