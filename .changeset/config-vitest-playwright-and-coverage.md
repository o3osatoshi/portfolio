---
"@o3osatoshi/config": minor
---

Refine Vitest presets and update toolchain dependencies.

- Added support for `@vitest/browser-playwright` and updated the `storybookTestPreset` to use the new `playwright` provider API, keeping browser tests aligned with Vitest 4.
- Expanded the `Options["test"]` type to include strongly typed `coverage` overrides and set more helpful defaults for `include`, `exclude`, `dir`, and coverage output paths in `baseTestPreset` / `browserTestPreset`.
- Bumped peer dependencies for `@microsoft/api-extractor`, `typescript`, and Vitest to the latest compatible versions and documented the expected toolchain, while keeping preset APIs and import paths stable.

