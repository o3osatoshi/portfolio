[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / browserPreset

# Function: browserPreset()

> **browserPreset**(`opts`): `Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>

Defined in: [packages/config/src/tsup/index.ts:30](https://github.com/o3osatoshi/experiment/blob/04dfa58df6e48824a200a24d77afef7ce464e1ae/packages/config/src/tsup/index.ts#L30)

Generate a tsup configuration for browser-facing React bundles.

- Targets ESM output and marks core React/Next dependencies as externals.
- Designed for packages consumed by Next.js (e.g. `packages/ui`).
- Tree-shaking and code splitting are enabled by default to keep bundles small.

## Parameters

### opts

`Options` = `{}`

Additional tsup Options to merge with the preset defaults.

## Returns

`Promise`\<`Options` \| `Options`[] \| (`overrideOptions`) => `MaybePromise`\<`Options` \| `Options`[]\>\>

Resolved tsup configuration ready to be consumed by tsup CLI.
