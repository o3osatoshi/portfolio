[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/config](../README.md) / storybookTestPreset

# Function: storybookTestPreset()

> **storybookTestPreset**(`opts`): `UserConfig`

Defined in: [packages/config/src/vitest/index.ts:124](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/config/src/vitest/index.ts#L124)

Creates a Storybook-aware Vitest configuration that enables browser projects by default.

## Parameters

### opts

[`Options`](../type-aliases/Options.md) = `{}`

Optional InlineConfig details and plugin registrations to merge into the preset.

## Returns

`UserConfig`

Vitest configuration produced via `defineConfig`.

## Remarks

Mirrors the base preset merge behaviour while ensuring Storybook projects run in Playwright-powered
Chromium. Any InlineConfig projects passed through `opts.test?.projects` are converted into inline
configurations with the Storybook defaults applied, while non-inline entries remain untouched.
Coverage retains the shared defaults unless fully redefined via `opts.test?.coverage`. Additional
Vite/Vitest plugins cascade through `opts.plugins`.
