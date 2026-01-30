[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @o3osatoshi/config

# @o3osatoshi/config

Shared configuration for my TypeScript projects.

- tsup presets (browser/public-dual/functions)
- TypeScript tsconfig bases (base/node/browser/next/functions/storybook)
- Biome shared configs (base, react, next)
- ESLint flat config (perfectionist import/order rules)

Exports
- `@o3osatoshi/config/tsup`
- `@o3osatoshi/config/tsconfig/*`
- `@o3osatoshi/config/biome/*`
- `@o3osatoshi/config/eslint/*`
- `@o3osatoshi/config/vitest`

## Installation

```sh
pnpm add -D @o3osatoshi/config

# Optional peers (depending on what you use)
# - For tsup presets / tsconfig usage
pnpm add -D tsup typescript
# - For ESLint flat config
pnpm add -D eslint @typescript-eslint/parser eslint-plugin-perfectionist
```

Notes
- Requires Node >= 22 (matches this repo engines).

## Usage

## tsup presets

Import presets from `@o3osatoshi/config/tsup` and export a config in `tsup.config.mjs`.

```ts
import { browserBundlePreset, publicDualBundlePreset, functionsBundlePreset } from "@o3osatoshi/config/tsup";

// Browser/React library (ESM, externals React/Next). DTS optional via { dts: true }.
export default browserBundlePreset({ entry: { index: "src/index.tsx" }, dts: true });

// Public library (ESM + CJS, with DTS).
//    Default sourcemap: enabled in production/CI, disabled in dev.
// export default publicDualBundlePreset({ entry: { index: "src/index.ts" } });

// Firebase Functions (ESM, Node target). Adjust target per runtime.
// export default functionsBundlePreset({ entry: { index: "src/index.ts" } });
```

Notes
- Externals are automatically derived from dependencies/peerDependencies of the nearest package.json. In addition, common UI libs are always externalized: `react`, `react-dom`, `next`.
- The browser bundle preset explicitly marks React/Next as externals for UI packages.
- Each preset accepts standard `tsup` `Options` and sets sensible defaults.
- `publicDualBundlePreset` enables `sourcemap` by default in production/CI; pass `{ sourcemap: false }` to disable.
- You can pass through `env`, `banner`, `external`, `outDir`, and `onSuccess` as needed.

Defaults (high-level)
- `browserBundlePreset`: ESM, platform `browser`, React/Next external, `dts` off by default.
- `publicDualBundlePreset`: ESM + CJS, DTS on, `sourcemap` on in CI/prd, off in dev.
- `functionsBundlePreset`: ESM, platform `node`, `target: node22`, sourcemap enabled.

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

## Vitest presets

Import presets from `@o3osatoshi/config/vitest` and export a config in `vitest.config.ts`.

```ts
import { fileURLToPath } from "node:url";

import tsconfigPaths from "vite-tsconfig-paths";
import { browserTestPreset } from "@o3osatoshi/config/vitest";

export default browserTestPreset({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./src/test/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    coverage: {
      exclude: ["next.config.mjs", "postcss.config.mjs"],
    },
  },
});
```

Notes
- `resolve` is forwarded to Vite, so you can define aliases without wrapping `mergeConfig`.
- Coverage options are rebuilt by the preset; specify all desired coverage fields when overriding.

## ESLint (flat config)

This package ships a small ESLint flat-config focused on import/export/property sorting via `eslint-plugin-perfectionist`.

Usage in a project root `eslint.config.mjs`:

```js
import config from "@o3osatoshi/config/eslint/config.mjs";

export default [...config];
```

What it does
- Registers `@typescript-eslint/parser` for TS files.
- Enables `perfectionist` rules for sorting imports/exports/objects, etc.
- Adds JSX prop sorting for React files.
- Ignores common output folders: `dist`, `.next`, `.turbo`, `storybook-static`, etc.

Peer deps
- `eslint` >= 9
- `@typescript-eslint/parser`
- `eslint-plugin-perfectionist`

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

- `@o3osatoshi/config/biome/base.json` (common base)
- `@o3osatoshi/config/biome/react.json` (additional React/JSX rules)
- `@o3osatoshi/config/biome/next.json` (Next.js recommended rules)

Example: For a React project that also uses Next.js, extend both `react.json` and `next.json`.

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
  "extends": ["@o3osatoshi/config/biome/react.json", "@o3osatoshi/config/biome/next.json"]
}
```

Within this monorepo, the root already extends `@o3osatoshi/config/biome/base.json`.

### What it enforces

- Base: double quotes (formatter), space indentation, import/key sorting, recommended rules, Project/Test domains.
- React: detect duplicate JSX props (`noDuplicateJsxProps`); sort class names for `clsx`/`cva`/`tw` (`useSortedClasses`).
- Next: enable `next` domain recommended rules.

#### Ready-made variants

- Next.js app:

  ```json
  {
    "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
    "extends": ["@o3osatoshi/config/biome/react.json", "@o3osatoshi/config/biome/next.json"]
  }
  ```

## Publishing

- Build: `pnpm build` (generates `dist/`)
- Publish to npm: `pnpm publish --access public`

The package exposes `tsup` presets, `tsconfig`, `biome`, and `eslint` exports. Install it as a dev dependency and import what you need per project.

Entry point for the shared configuration package. Currently exposes tsup presets and a Vitest base config.

## Type Aliases

- [Options](type-aliases/Options.md)

## Functions

- [baseTestPreset](functions/baseTestPreset.md)
- [browserBundlePreset](functions/browserBundlePreset.md)
- [browserTestPreset](functions/browserTestPreset.md)
- [functionsBundlePreset](functions/functionsBundlePreset.md)
- [publicDualBundlePreset](functions/publicDualBundlePreset.md)
- [storybookTestPreset](functions/storybookTestPreset.md)
