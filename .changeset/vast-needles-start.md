---
"@o3osatoshi/config": major
"@o3osatoshi/toolkit": minor
"@o3osatoshi/ui": patch
---

Release summary (since 0.0.3 on Sep 22)

@o3osatoshi/config – major

- Breaking: Vitest preset API names and options were normalized. Update imports to `baseTestPreset`, `browserTestPreset`, and the new `storybookTestPreset`. When overriding coverage or setup, pass them via `opts.test` and provide full objects because the preset rebuilds coverage.
- Added: Storybook-focused test preset; coverage options and plugin pass-through; clearer defaults and docs.
- Build: tsup config migrated to TypeScript; tsconfig presets refined; API Extractor config added; production scripts renamed to `prd`.
- Migration example:
  `import { baseTestPreset } from "@o3osatoshi/config/vitest"; export default baseTestPreset({ test: { /* overrides */ } });`

@o3osatoshi/toolkit – minor

- Added: `sleep` with AbortSignal and `ResultAsync`; `newFetchError` with overrideable classification; `toHttpErrorResponse`; error serialization/deserialization utilities; `truncate` string helper.
- Improved: error kind detection and HTTP status mapping; message formatting; Zod error utils; consolidated exports and docs.
- No breaking changes expected for public APIs.

@o3osatoshi/ui – patch

- No public API changes. Upgraded Storybook to v9, consolidated stories into the package, expanded tests and coverage config, integrated API Extractor, and fixed dev/build scripts. Consumers should see identical component APIs with improved type metadata.
