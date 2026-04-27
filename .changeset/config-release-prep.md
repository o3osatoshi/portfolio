---
"@o3osatoshi/config": minor
---

Add Vite `resolve` forwarding to the shared Vitest presets, so consumers can pass aliases and related resolve settings through `baseTestPreset`, `browserTestPreset`, and `storybookTestPreset`.

Add ESLint guardrails against unsafe production type assertions, ignore temporary API Extractor JSON files, validate package metadata used by tsup external inference with Zod, and make the shared tsup bundle presets resolve synchronously.
