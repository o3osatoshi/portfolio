# CLAUDE.md - Toolkit Package

This file provides guidance for the `@repo/toolkit` package - shared utilities and helper functions across the monorepo.

## Package Overview

The toolkit package provides common utilities, error handling, and helper functions that can be used across all layers of the application.

## Package Structure

- **src/error.ts**: Centralized error handling utilities
- **src/index.ts**: Main export file for all utilities

## Key Features

### Error Handling
- **Standardized Errors**: Consistent error structure across the application
- **Error Factory Functions**: `newError()` function for creating structured errors
- **Layer Identification**: Errors include layer information (Domain, Application, Infrastructure)
- **Error Categories**: Different error kinds (Validation, NotFound, etc.)

### Utility Functions
- Common helper functions that don't belong to specific domain logic
- Type utilities for enhanced TypeScript support
- Shared constants and configuration values

## Development Commands

**Build the package:**
```bash
pnpm build    # Build with TypeScript compiler
pnpm dev      # Watch mode for development
```

**Testing:**
```bash
pnpm test     # Run utility tests
```

**Clean up:**
```bash
pnpm clean    # Remove dist directory
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

## Package Configuration

- **Type**: ESM module with TypeScript support
- **Dependencies**: Minimal dependencies for maximum compatibility
- **Exports**: Single entry point with all utilities
- **Build**: Fast bundling with tsup

## Important Notes

- **Framework Agnostic**: No external framework dependencies
- **Layer Neutral**: Can be used by any architectural layer
- **Error Consistency**: Provides standard error format for the entire application
- **Type Safety**: Full TypeScript support with proper type exports