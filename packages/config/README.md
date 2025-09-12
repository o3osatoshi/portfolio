# @o3osatoshi/config

Shared configuration for my TypeScript projects.

- tsup presets (library/dual-format/browser/CLI/prisma/multi-entry/functions)
- TypeScript tsconfig bases (base/node/browser/next/functions/storybook)

## Installation

```sh
pnpm add -D @o3osatoshi/config
```

## Usage

## tsup presets

Import presets from `@o3osatoshi/config/tsup` and export a config in `tsup.config.mjs`.

```ts
import {
  internalEsmPreset,
  publicDualPreset,
  browserPreset,
  nodeCliPreset,
  prismaPreset,
  multiEntryEsmPreset,
  functionsPreset,
} from "@o3osatoshi/config/tsup";

// 1) Internal library (ESM only)
export default await internalEsmPreset({ entry: { index: "src/index.ts" } });

// 2) Public library (ESM + CJS, with DTS). withSourceMap = false by default
// export default await publicDualPreset({ entry: { index: "src/index.ts" }, sourcemap: false });

// 3) Browser/React library (ESM, externals React/Next). DTS optional via { dts: true }.
// export default await browserPreset({ entry: { index: "src/index.tsx" }, dts: true });

// 4) Node CLI (CJS with shebang)
// export default await nodeCliPreset({ entry: { cli: "src/cli.ts" } });

// 5) Prisma helpers (transpile only; prisma client stays external)
// export default await prismaPreset({ entry: { index: "src/index.ts" } });

// 6) Multi‑entry ESM (internal)
// export default await multiEntryEsmPreset({ entry: { index: "src/index.ts", util: "src/util.ts" } });

// 7) Firebase Functions (ESM, Node target). Adjust target per runtime.
// export default await functionsPreset({ entry: { index: "src/index.ts" } });
```

Notes
- Externals are automatically derived from dependencies/peerDependencies; common React/Next externals are also considered. The browser preset explicitly marks React/Next as externals for UI packages.
- Each preset now accepts a single `opts: PresetOptions` and sets defaults in the preset itself.
- `publicDualPreset` enables `sourcemap` by default in production; pass `{ sourcemap: false }` to disable.
- You can pass through `env`, `banner`, `external`, `outDir`, and `onSuccess` as needed.

## tsconfig bases
Pick a base that fits your project (TS 5+, `moduleResolution: "Bundler"`).

```jsonc
// Node/Library (default)
{
  "extends": "@o3osatoshi/config/tsconfig/node.json"
}
```

```jsonc
// Next.js app
{
  "extends": "@o3osatoshi/config/tsconfig/next.json"
}
```

```jsonc
// Firebase Functions (typecheck‑only; output is handled by your bundler)
{
  "extends": "@o3osatoshi/config/tsconfig/functions.json"
}
```

```jsonc
// Storybook (React + Vite)
{
  "extends": "@o3osatoshi/config/tsconfig/storybook.json"
}
```


## Biome (shared config)

This package also exports a shared Biome configuration so multiple repositories can share the same lint/format rules.

Usage in another repository:

1. Install the package as a dev dependency.

   ```bash
   pnpm add -D @o3osatoshi/config
   ```

2. Create `biome.json` at the repository root and extend the shared config:

   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
     "extends": ["@o3osatoshi/config/biome"]
   }
   ```

### Variants (optional)

If you need different presets for specific contexts (e.g. `strict`, `next`, `functions`), add files under `packages/config/biome/` (e.g. `strict.json`) and reference them:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
  "extends": ["@o3osatoshi/config/biome/strict.json"]
}
```

Within this monorepo, the root already extends `./packages/config/biome/base.json`.


## Publishing

- Build: `pnpm build` (generates `dist/`)
- Publish to npm: `pnpm publish --access public`

Add `@o3osatoshi/config` as a dev dependency to consume the tsup presets and tsconfig bases.
