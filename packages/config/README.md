# @o3osatoshi/config

Shared configuration presets for TypeScript projects.

- tsup presets for libraries and multi‑entry builds
- TypeScript `tsconfig` bases for Node, React, and Next.js
- Vitest base configuration

## Installation

```sh
pnpm add -D @o3osatoshi/config
```

## Usage

### tsup
```ts
import { libraryPreset, dualFormatPreset, multiEntryPreset } from "@o3osatoshi/config/tsup";

// Simple ESM library build with types
export default libraryPreset();

// Or dual ESM/CJS output
// export default dualFormatPreset();

// Or multiple entry points
// export default multiEntryPreset({ index: "src/index.ts", cli: "src/cli.ts" });
```

### tsconfig
Pick a base that fits your project:

```jsonc
// Node/Library (default)
{
  "extends": "@o3osatoshi/config/tsconfig/base.json"
}
```

```jsonc
// React application
{
  "extends": "@o3osatoshi/config/tsconfig/react-app.json"
}
```

```jsonc
// React library
{
  "extends": "@o3osatoshi/config/tsconfig/react-library.json"
}
```

```jsonc
// Next.js app
{
  "extends": "@o3osatoshi/config/tsconfig/nextjs.json"
}
```

### Vitest
```ts
import base from "@o3osatoshi/config/vitest/base";
export default base;

// To customize:
// import { defineConfig } from "vitest/config";
// export default defineConfig({
//   ...base,
//   test: { ...base.test, coverage: { enabled: true } },
// });
```

## Publishing

- Build: `pnpm build` (generates `dist/`)
- Publish to npm: `pnpm publish --access public`

Consumers only need to add `@o3osatoshi/config` as a dev dependency to use the shared presets and configs.
