# @o3osatoshi/config

Shared configuration for my TypeScript projects.

- tsup presets (library/dual-format/browser/CLI/prisma/multi-entry/functions)
- TypeScript tsconfig bases (base/node/browser/next/functions/storybook)
- Biome shared configs (base, web)

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

// 2) Public library (ESM + CJS, with DTS).
//    Default sourcemap: enabled in production/CI, disabled in dev.
//    Pass { sourcemap: false } to disable in prod.
// export default await publicDualPreset({ entry: { index: "src/index.ts" } });

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
- Each preset accepts standard `tsup` `Options` and sets sensible defaults.
- `publicDualPreset` enables `sourcemap` by default in production/CI; pass `{ sourcemap: false }` to disable.
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
// Browser library (React/Vite)
{
  "extends": "@o3osatoshi/config/tsconfig/browser.json"
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

2. Create `biome.json` at the repository root and extend the shared config (using the package export):

   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
     "extends": ["@o3osatoshi/config/biome/base.json"]
   }
   ```

3. (Recommended) Mark it as the root config so Biome doesn’t traverse upward:

   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
     "root": true,
     "extends": ["@o3osatoshi/config/biome/base.json"]
   }
   ```

### Variants (optional)

If you need different presets for specific contexts, you can publish additional files under `packages/config/biome/` and extend them from the package export. This repo currently ships:

- `@o3osatoshi/config/biome/base.json`
- `@o3osatoshi/config/biome/web.json` (Next.js/web-oriented tweaks)

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
  "extends": ["@o3osatoshi/config/biome/web.json"]
}
```

Within this monorepo, the root already extends `@o3osatoshi/config/biome/base.json`.

### What it enforces

- Double quotes across JS/TS formatting.
- Organized imports and sorted object keys via assist actions.
- Recommended lint rules plus explicit `noDuplicateJsxProps`.
- Class name sorting for utilities like `clsx`, `cva`, and `tw`.
- `web.json` adds `next` domain recommended rules for Next.js apps.

#### Ready-made variants

- Web (Next.js app):

  ```json
  {
    "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
    "extends": ["./node_modules/@o3osatoshi/config/biome/web.json"]
  }
  ```


## Publishing

- Build: `pnpm build` (generates `dist/`)
- Publish to npm: `pnpm publish --access public`

Add `@o3osatoshi/config` as a dev dependency to consume the tsup presets and tsconfig bases.
