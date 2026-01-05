[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / browserBundlePreset

# Function: browserBundlePreset()

> **browserBundlePreset**(`opts`): `Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>

Defined in: [packages/config/src/tsup/index.ts:31](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/config/src/tsup/index.ts#L31)

Creates a tsup configuration preset tailored for browser-facing React bundles.

## Parameters

### opts

`Options` = `{}`

Additional tsup options to override the preset defaults.

## Returns

`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>

Resolved configuration object that can be passed directly to the tsup CLI.

## Remarks

- Emits ESM output and automatically marks core React/Next dependencies as externals.
- Enables tree shaking and code splitting by default to keep bundle size small.
