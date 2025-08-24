# CLAUDE.md - Firebase Functions

This file provides guidance for the Firebase Cloud Functions application within the monorepo.

## Application Overview

Firebase Cloud Functions app provides serverless backend logic, API endpoints, and background processing for the portfolio application.

## Application Structure

- **src/index.ts**: Main functions entry point and exports
- **http/**: HTTP-related development utilities
  - **requests.http**: HTTP client requests for testing
  - **http-client.private.env.json**: Environment variables for HTTP client
- **dist/**: Compiled JavaScript output for deployment

## Development Setup

### Build Configuration
- **tsup**: Fast TypeScript bundling with ESM output
- **Firebase CLI**: Functions deployment and local development
- **Node.js 22**: Uses latest Node.js runtime for functions

### Environment Configuration
- Environment variables should be configured via Firebase config
- Local development uses `.env` files
- Production uses Firebase environment configuration

## Development Commands

**Local Development:**
```bash
pnpm dev              # Watch mode with tsup
pnpm build            # Build functions for deployment
```

**Firebase Operations:**
```bash
pnpm deploy:functions # Build and deploy to Firebase (runs from workspace root)
firebase serve --only functions  # Local emulator
firebase logs --only functions   # View function logs
```

**Testing:**
```bash
# Use HTTP files in http/ directory for testing endpoints
# Configure environment in http-client.private.env.json
```

## Firebase Integration

### Function Types
- **HTTP Functions**: REST API endpoints
- **Callable Functions**: Client SDK callable functions
- **Triggered Functions**: Database, authentication, storage triggers
- **Scheduled Functions**: Cron-like background tasks

### Deployment Process
- **Pre-deploy Hook**: Automatically runs `pnpm build:functions` from workspace root
- **Environment Variables**: Configure via Firebase CLI or console
- **Runtime**: Node.js 22 with ESM module support

## Monorepo Integration

### Package Dependencies
- Can import from workspace packages (`@repo/domain`, `@repo/application`, etc.)
- Shared business logic through application layer
- Database access via `@repo/prisma` infrastructure layer

### Build Process
- **Turbo Integration**: Part of workspace build system
- **Shared TypeScript Config**: Uses `@repo/tsrc` configuration
- **Environment Variables**: Defined in turbo.json for builds

## API Design

### Clean Architecture Integration
```typescript
// Example function structure
import { GetTransactionsUseCase } from '@repo/application';
import { TransactionRepository } from '@repo/prisma';

export const getTransactions = onCall(async (request) => {
  const repository = new TransactionRepository();
  const useCase = new GetTransactionsUseCase(repository);
  
  const result = await useCase.execute(request.data.userId);
  
  if (result.isErr()) {
    throw new HttpsError('internal', result.error.message);
  }
  
  return result.value;
});
```

### Error Handling
- Use Firebase HttpsError for client-facing errors
- Leverage Result pattern from domain/application layers
- Proper error logging for debugging

## Security

### Authentication
- Firebase Authentication integration
- JWT token validation for protected endpoints
- User context available in function request

### Authorization
- Implement business logic authorization in application layer
- Database-level security via repository patterns
- Input validation using `@repo/validation` schemas

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- Any API keys for external services
- Firebase-specific configuration (automatically provided)

## Important Notes

- **Monorepo Builds**: Functions are built as part of workspace build process
- **Clean Architecture**: Use application layer for business logic
- **Database Access**: Always go through repository interfaces
- **Error Handling**: Use Result pattern and proper Firebase error types
- **Performance**: Consider cold start optimization for HTTP functions