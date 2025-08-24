# CLAUDE.md - TypeScript Configuration Package

This file provides guidance for the `@repo/tsrc` package - shared TypeScript configurations across the monorepo.

## Package Overview

The tsrc package provides centralized TypeScript configuration files that are shared across all packages and applications in the monorepo for consistency and maintainability.

## Package Structure

- **base.json**: Base TypeScript configuration with common compiler options
- **nextjs.json**: Next.js specific TypeScript configuration
- **react-app.json**: React application TypeScript configuration  
- **react-library.json**: React library TypeScript configuration
- **package.json**: Package metadata and exports

## Configuration Files

### base.json
- **Core Settings**: Fundamental TypeScript compiler options
- **Module System**: ESNext modules with Node resolution
- **Strict Mode**: Enabled for maximum type safety
- **Target**: Modern JavaScript (ES2022)

### nextjs.json
- **Next.js Optimizations**: Specific settings for Next.js applications
- **JSX Configuration**: React JSX transform settings
- **Path Mapping**: Support for Next.js path aliases
- **Incremental Compilation**: Optimized for Next.js build system

### react-app.json
- **React Applications**: Configuration for standalone React apps
- **JSX Support**: Modern JSX transform
- **DOM Types**: Browser and DOM type definitions
- **Bundler Resolution**: Module resolution for bundlers

### react-library.json
- **Component Libraries**: Optimized for React component packages
- **Declaration Generation**: Produces TypeScript declaration files
- **Library Mode**: Configured for library distribution
- **Export Optimization**: Proper module exports for consumption

## Usage Patterns

### In Applications (Next.js)
```json
{
  "extends": "@repo/tsrc/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### In Libraries
```json
{
  "extends": "@repo/tsrc/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.*", "**/*.spec.*"]
}
```

## Key Features

### Consistent Configuration
- **Monorepo Standards**: All packages use the same TypeScript settings
- **Shared Compiler Options**: Consistent strictness and module handling
- **Path Resolution**: Standardized module resolution across packages

### Modern TypeScript
- **Latest Features**: Uses modern TypeScript features and syntax
- **Strict Type Checking**: Maximum type safety with strict mode
- **Performance Optimizations**: Incremental compilation and caching

### Framework Specific
- **Next.js Ready**: Pre-configured for Next.js applications
- **React Optimized**: Proper JSX and React type handling
- **Library Support**: Declaration file generation for packages

## Maintenance

### Updates
- Keep TypeScript version aligned across all configurations
- Update target/lib settings as browser support evolves
- Monitor TypeScript releases for new features and options

### Customization
- Applications can extend base configurations with specific needs
- Path mappings and includes/excludes are customizable per package
- Compiler options can be overridden when necessary

## Important Notes

- **Version Consistency**: All packages should use the same TypeScript version
- **Strict Mode**: All configurations enforce strict type checking
- **Modern Target**: Configured for modern JavaScript environments
- **Incremental**: Optimized for fast compilation in monorepo environments