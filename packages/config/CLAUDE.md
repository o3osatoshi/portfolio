# CLAUDE.md - Config Package

This file provides guidance for the `@o3osatoshi/config` package - shared build configurations and TypeScript settings for the monorepo.

## Package Overview

The config package provides reusable build configurations, TypeScript presets, and development tools to ensure consistency across all packages in the monorepo.

## Package Structure

- **src/tsup/**: Tsup build configuration presets
  - **index.ts**: Export all tsup presets and utility functions
- **tsconfig/**: TypeScript configuration presets
  - **base.json**: Base TypeScript configuration with strict settings
  - **node.json**: Node.js-specific configuration
  - **browser.json**: Browser/client-side configuration
  - **next.json**: Next.js application configuration
  - **functions.json**: Firebase Functions configuration
  - **storybook.json**: Storybook-specific configuration
- **tsconfig.json**: Package-specific TypeScript configuration (extends node.json)
- **tsup.config.mjs**: Build configuration for this package itself

## Tsup Presets

### Available Presets
- **`internalEsmPreset`**: Fast ESM-only builds for internal monorepo packages
- **`publicDualPreset`**: Dual ESM+CJS builds with DTS for publishable libraries
- **`browserPreset`**: Browser-optimized builds for React components
- **`nodeCliPreset`**: Single-file CJS builds for CLI tools with shebang
- **`prismaPreset`**: Transpile-only preset for Prisma packages
- **`multiEntryEsmPreset`**: Multiple entry points for internal packages
- **`functionsPreset`**: Node22 ESM builds for Firebase Functions

### Core Features
- **Auto-externals**: Automatically externalize dependencies and peerDependencies
- **Consistent Defaults**: Target ES2022, Node platform, clean builds
- **Environment Detection**: Different behaviors for CI vs development
- **Type Safety**: Full TypeScript support with configurable DTS generation
- **Package.json Discovery**: Finds nearest package.json for dependency detection

## TypeScript Configurations

### Base Configuration
- **Strict Mode**: Maximum type safety with all strict options enabled
- **Modern Target**: ES2022 target with latest language features
- **Performance**: Incremental compilation with build info caching
- **Module Resolution**: Force module detection and isolated modules

### Specialized Configs
- **Node**: CommonJS and Node.js APIs
- **Browser**: DOM types and browser-specific settings
- **Next.js**: Next.js-specific module resolution and JSX
- **Functions**: Firebase Functions Node runtime configuration
- **Storybook**: Storybook-specific build settings

## Development Commands

**Build the package:**
```bash
pnpm build         # Build tsup presets with type definitions
pnpm clean         # Remove dist directory
pnpm typecheck     # TypeScript type checking
```

**Publishing:**
```bash
pnpm prepublishOnly  # Full build pipeline with type checking
```

## Usage Examples

### Using Tsup Presets
```typescript
// In any package's tsup.config.ts
import { internalEsmPreset } from "@o3osatoshi/config/tsup";

export default await internalEsmPreset();
```

### Using TypeScript Configs
```json
// In any package's tsconfig.json
{
  "extends": "@o3osatoshi/config/tsconfig/node.json",
  "include": ["src"]
}
```

### Custom Preset Options
```typescript
import { defineTsupPreset } from "@o3osatoshi/config/tsup";

export default await defineTsupPreset({
  entry: { index: "src/index.ts", cli: "src/cli.ts" },
  format: ["esm", "cjs"],
  dts: true,
  minify: true
});
```

## Package Publication

- **Public Package**: Published to npm as `@o3osatoshi/config`
- **Peer Dependencies**: Requires `tsup` and `typescript` as peer dependencies
- **Files**: Publishes `dist/`, `tsconfig/`, `README.md`, and `LICENSE`
- **Access**: Public access on npm registry
- **Versioning**: Semantic versioning with automated publishing

## Dependencies

- **Peer Dependencies**: `tsup ^8.4.0`, `typescript ^5.8.3`
- **Development**: `@types/node`, `rimraf`, `tsup`, `typescript`
- **Node.js**: Requires Node.js >= 22 (specified in engines)

## Design Principles

- **Zero Configuration**: Sensible defaults for most use cases
- **Composable**: Mix and match presets for specific needs
- **Performance First**: Fast builds with minimal overhead
- **Type Safety**: Full TypeScript support across all configurations
- **Monorepo Optimized**: Designed for workspace development patterns
- **CI/CD Ready**: Environment-aware builds for different deployment contexts

## Important Notes

- **Auto-externalization**: Dependencies are automatically externalized for smaller bundles
- **Environment Detection**: Different behaviors in CI vs development environments
- **Package Discovery**: Automatically finds and reads package.json for configuration
- **Build Caching**: Incremental compilation with tsbuildinfo caching
- **Modern Standards**: Uses latest TypeScript and build tool features
- **Workspace Compatible**: Designed for pnpm workspace environments
- **Publishing Ready**: Full npm publication setup with proper metadata