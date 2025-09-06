# CLAUDE.md - Toolkit Package

This file provides guidance for the `@o3osatoshi/toolkit` package - shared utilities for error handling and validation across the monorepo.

## Package Overview

The toolkit package provides error handling utilities, Zod integration helpers, and validation utilities that can be used across all architectural layers. This is a **public npm package** designed for broader community use.

## Package Structure

- **src/error.ts**: Centralized error handling utilities with neverthrow integration
- **src/zod-error.ts**: Zod error transformation utilities
- **src/zod-parse.ts**: Safe Zod parsing utilities with Result pattern
- **src/index.ts**: Main export file for all utilities

## Key Features

### Error Handling
- **Standardized Errors**: Consistent error structure across applications
- **Error Factory Functions**: `newError()` function for creating structured errors
- **Layer Identification**: Errors include layer information (Domain, Application, Infrastructure)
- **Error Categories**: Different error kinds (Validation, NotFound, Unauthorized, ServerError)
- **neverthrow Integration**: Seamless Result pattern support

### Zod Integration
- **Safe Parsing**: `safeParse()` utilities that return Result types
- **Error Transformation**: Convert Zod errors to standardized error format
- **Validation Helpers**: Common validation patterns and utilities
- **Type Safety**: Full TypeScript integration with Zod schemas

## Development Commands

**Build the package:**
```bash
pnpm build         # Build with tsup (ESM + CJS + DTS)
pnpm dev           # Watch mode for development
pnpm typecheck     # TypeScript type checking
```

**Testing:**
```bash
pnpm test          # Run tests with Vitest
pnpm test:run      # Same as pnpm test
```

**Publishing:**
```bash
pnpm clean         # Remove dist directory
pnpm prepublishOnly # Full build, test, and typecheck pipeline
```

## Error Handling Pattern

### Error Structure
```typescript
interface ApplicationError {
  layer: 'Domain' | 'Application' | 'Infrastructure' | 'Presentation';
  kind: 'Validation' | 'NotFound' | 'Unauthorized' | 'ServerError';
  action: string;
  reason?: string;
  cause?: unknown;
}
```

### Usage Examples
```typescript
// Create a domain validation error
const error = newError({
  layer: 'Domain',
  kind: 'Validation',
  action: 'CreateTransaction',
  reason: 'Invalid transaction amount'
});

// Create infrastructure error with cause
const dbError = newError({
  layer: 'Infrastructure',
  kind: 'ServerError',
  action: 'SaveTransaction',
  cause: originalError
});
```

## Integration with neverthrow

- Works seamlessly with `neverthrow` Result pattern
- Errors can be wrapped in `err()` for Result types
- Consistent error handling across all application layers

## Zod Integration Utilities

### Safe Parsing
```typescript
import { safeParse } from '@o3osatoshi/toolkit';
import { z } from 'zod';

const schema = z.string();
const result = safeParse(schema, "valid string");
// Returns Result<string, Error>
```

### Error Transformation
```typescript
import { zodErrorToAppError } from '@o3osatoshi/toolkit';

// Converts ZodError to standardized ApplicationError
const appError = zodErrorToAppError(zodError, 'ValidateInput');
```

## Package Configuration

- **Type**: Dual ESM + CommonJS module with full TypeScript support
- **Dependencies**: `neverthrow` and `zod` for core functionality
- **Exports**: Single entry point with comprehensive type definitions
- **Build**: Fast bundling with tsup using custom preset
- **Target**: Node.js 22+ (specified in engines)
- **Distribution**: Public npm package (`@o3osatoshi/toolkit`)

## Publication Information

- **Repository**: https://github.com/o3osatoshi/portfolio
- **Package Directory**: `packages/toolkit`
- **License**: MIT
- **Keywords**: `zod`, `neverthrow`, `error-handling`, `validation`, `result`, `typescript`
- **Homepage**: https://github.com/o3osatoshi/portfolio#readme

## Important Notes

- **Framework Agnostic**: No external framework dependencies beyond core utilities
- **Layer Neutral**: Can be used by any architectural layer (Domain, Application, Infrastructure)
- **Error Consistency**: Provides standard error format across applications
- **Type Safety**: Full TypeScript support with proper type exports
- **Public Package**: Designed for community use with proper npm metadata
- **Zero Breaking Changes**: Semantic versioning and backward compatibility focus