# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

This is the `@repo/validation` package - a shared validation library built with Zod for type-safe schema validation across the monorepo.

## Development Commands

**Build the package:**
```bash
pnpm build    # Build with tsup (ESM format, generates types)
pnpm dev      # Watch mode for development
```

**Testing:**
```bash
pnpm test     # Run tests with Vitest
```

**Clean up:**
```bash
pnpm clean    # Remove dist directory
```

## Architecture

- **Build System**: Uses tsup for fast TypeScript bundling with ESM output
- **Testing**: Vitest for unit tests with TypeScript support
- **Validation**: Zod for runtime type checking and schema validation
- **Output**: ESM module with TypeScript declarations in `dist/`

## Key Patterns

- Export Zod schemas alongside TypeScript types using `z.infer<typeof Schema>`
- Provide validation functions that parse and validate input data
- Use descriptive schema names following `[Entity]Schema` convention
- Keep validation logic simple and focused on data structure validation

## Package Configuration

- **Type**: ESM module with sideEffects: false for optimal bundling
- **Exports**: Single entry point at `./dist/index.js` with types
- **Dependencies**: Zod for validation, minimal surface area
- **TypeScript**: Extends shared config from `@repo/tsrc`