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
export default await internalEsmPreset({ index: "src/index.ts" });

// 2) Public library (ESM + CJS, with DTS). withSourceMap = false by default
// export default await publicDualPreset({ index: "src/index.ts" }, false);

// 3) Browser/React library (ESM, externals React/Next). DTS optional via { dts: true }.
// export default await browserPreset({ index: "src/index.tsx" }, { dts: true });

// 4) Node CLI (CJS with shebang)
// export default await nodeCliPreset({ cli: "src/cli.ts" });

// 5) Prisma helpers (transpile only; prisma client stays external)
// export default await prismaPreset({ index: "src/index.ts" });

// 6) Multi‑entry ESM (internal)
// export default await multiEntryEsmPreset({ index: "src/index.ts", util: "src/util.ts" });

// 7) Firebase Functions (ESM, Node target). Adjust target per runtime.
// export default await functionsPreset({ index: "src/index.ts" });
```

Notes
- Externals are automatically derived from dependencies/peerDependencies; common React/Next externals are also considered. The browser preset explicitly marks React/Next as externals for UI packages.
- `publicDualPreset` accepts a boolean `withSourceMap` (default false).
- You can pass through `env`, `banner`, and `external` as needed.

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


## Publishing

- Build: `pnpm build` (generates `dist/`)
- Publish to npm: `pnpm publish --access public`

Add `@o3osatoshi/config` as a dev dependency to consume the tsup presets and tsconfig bases.
