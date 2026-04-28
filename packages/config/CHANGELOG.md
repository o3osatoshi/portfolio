# @o3osatoshi/config

## 1.3.0

### Minor Changes

- [#96](https://github.com/o3osatoshi/portfolio/pull/96) [`5808883`](https://github.com/o3osatoshi/portfolio/commit/5808883be92e7e248b47845486a8de30e529b633) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - Add `nodeCliBundlePreset` for distributable Node.js CLI packages.

## 1.2.1

### Patch Changes

- [#94](https://github.com/o3osatoshi/portfolio/pull/94) [`3b29d88`](https://github.com/o3osatoshi/portfolio/commit/3b29d8840a8c776e5e6f02a81446f0aa816f6e0d) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - Ignore coverage report output in shared ESLint config.

## 1.2.0

### Minor Changes

- [#90](https://github.com/o3osatoshi/portfolio/pull/90) [`ba6e5ae`](https://github.com/o3osatoshi/portfolio/commit/ba6e5ae46a4700e8e9bb396dbc0b0ff680e3a01d) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - Add Vite `resolve` forwarding to the shared Vitest presets, so consumers can pass aliases and related resolve settings through `baseTestPreset`, `browserTestPreset`, and `storybookTestPreset`.

  Add ESLint guardrails against unsafe production type assertions, ignore temporary API Extractor JSON files, validate package metadata used by tsup external inference with Zod, and make the shared tsup bundle presets resolve synchronously.

## 1.1.1

### Patch Changes

- [#54](https://github.com/o3osatoshi/portfolio/pull/54) [`d2efb58`](https://github.com/o3osatoshi/portfolio/commit/d2efb580b2bf66ad97014d549c462e20da49aed2) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - - No functional changes; republished to align the workspace release set.

## 1.1.0

### Minor Changes

- [#47](https://github.com/o3osatoshi/portfolio/pull/47) [`ff2b6e3`](https://github.com/o3osatoshi/portfolio/commit/ff2b6e3a65ba1cdc8bfec07ff0939aa535fcc44e) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - Refine Vitest presets and update toolchain dependencies.
  - Added support for `@vitest/browser-playwright` and updated the `storybookTestPreset` to use the new `playwright` provider API, keeping browser tests aligned with Vitest 4.
  - Expanded the `Options["test"]` type to include strongly typed `coverage` overrides and set more helpful defaults for `include`, `exclude`, `dir`, and coverage output paths in `baseTestPreset` / `browserTestPreset`.
  - Bumped peer dependencies for `@microsoft/api-extractor`, `typescript`, and Vitest to the latest compatible versions and documented the expected toolchain, while keeping preset APIs and import paths stable.

## 1.0.0

### Major Changes

- [#17](https://github.com/o3osatoshi/portfolio/pull/17) [`cb7dbcc`](https://github.com/o3osatoshi/portfolio/commit/cb7dbcc30b6a260d4a68d91fdd52898d8f37a9ea) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - Release summary (since 0.0.3 on Sep 22)
  - Breaking: Vitest preset API names and options were normalized. Update imports to `baseTestPreset`, `browserTestPreset`, and the new `storybookTestPreset`. When overriding coverage or setup, pass them via `opts.test` and provide full objects because the preset rebuilds coverage.
  - Added: Storybook-focused test preset; coverage options and plugin pass-through; clearer defaults and docs.
  - Build: tsup config migrated to TypeScript; tsconfig presets refined; API Extractor config added; production scripts renamed to `prd`.
  - Migration example:
    `import { baseTestPreset } from "@o3osatoshi/config/vitest"; export default baseTestPreset({ test: { /* overrides */ } });`

## 0.0.3

### Patch Changes

- [`9e38d97`](https://github.com/o3osatoshi/portfolio/commit/9e38d974325ac83433609670b6bc2ecc803c6050) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - release test

## 0.0.2

### Patch Changes

- [`bc9ed90`](https://github.com/o3osatoshi/portfolio/commit/bc9ed90a7831a8d366984fad24c2f087b478f1f8) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - release test

## 0.0.1

### Patch Changes

- [`fd705ac`](https://github.com/o3osatoshi/portfolio/commit/fd705acbd21d8485a96ce840f954947e9bd8d27e) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - initial publish
