# @o3osatoshi/config

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
