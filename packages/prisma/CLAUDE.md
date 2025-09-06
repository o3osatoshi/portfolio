# CLAUDE.md - Prisma Package

This file provides Prisma-specific guidance for Claude Code when working with the infrastructure database layer.

## Package Structure

- **schema/**: Contains schema and migration files
  - **models/**: Modular schema files (users.prisma, transactions.prisma, etc.)
  - **migrations/**: Database migration history
  - **schema.prisma**: Main schema file that includes model files
- **scripts/**: Database utilities and tooling
  - **seed.ts**: Database seeding script
- **src/**: TypeScript source code
  - **adapters/**: Repository implementations (Infrastructure layer)
    - **prisma-transaction.repository.ts**: Transaction repository implementation
    - **prisma-transaction.repository.int.spec.ts**: Integration tests with TestHelpers class
    - **index.ts**: Exports all repository implementations
  - **prisma-client.ts**: Prisma client configuration and export with global singleton pattern
  - **prisma-error.ts**: Database-specific error handling and validation
  - **index.ts**: Package entry point exporting adapters and client
- **generated/**: Prisma client generated files (auto-generated, do not edit)
- **vitest.int.config.ts**: Integration test configuration for Testcontainers

## Development Commands

**Database operations:**
```bash
pnpm db:push          # Push schema changes without creating migrations
pnpm db:push:prod     # Push schema changes to production
pnpm db:push:prod:force # Force push with data loss acceptance
pnpm db:reset         # Reset development database with migrations
pnpm db:reset:skip-seed # Reset without running seed
pnpm db:seed          # Run database seeding script (scripts/seed.ts)
pnpm db:seed:prod     # Seed production database
```

**Migration commands:**
```bash
pnpm migrate:dev      # Run development migrations with .env.development.local
pnpm migrate:deploy   # Deploy migrations to production with .env.production.local
pnpm migrate:status   # Check migration status (development)
pnpm migrate:status:prod # Check migration status (production)
```

**Prisma-specific:**
```bash
pnpm generate         # Generate Prisma client after schema changes (runs on postinstall)
pnpm studio           # Open Prisma Studio for database browsing (development)
pnpm studio:prod      # Open Prisma Studio for production database
pnpm format           # Format Prisma schema files
```

**Testing:**
```bash
pnpm test             # Run unit tests (excludes integration tests)
pnpm test:int         # Run integration tests with Testcontainers (requires Docker)
pnpm test:run         # Run unit tests once
pnpm test:run:int     # Run integration tests once
pnpm typecheck        # TypeScript type checking
```

**Environment helpers:**
```bash
pnpm with:dev         # Run commands with .env.development.local
pnpm with:prod        # Run commands with .env.production.local
```

## Schema Architecture

- Uses modular schema files in `schema/models/` directory
- Main `schema.prisma` includes model files using relative paths
- Generated client outputs to `generated/prisma` directory
- PostgreSQL database with connection via DATABASE_URL environment variable
- Schema location configured via `prisma.schema` in package.json

## Environment Configuration

- **Development**: Uses `.env.development.local` for migrations and operations
- **Production**: Uses `.env.production.local` for deployments
- Environment-specific commands use dotenv-cli with `with:dev` and `with:prod` scripts
- DATABASE_URL must be set in appropriate environment files

## Clean Architecture Implementation

- **Repository Pattern**: Adapters implement domain interfaces from `@repo/domain`
- **Error Handling**: Uses `neverthrow` Result pattern with custom database errors
- **Type Safety**: Converts Prisma models to domain entities via mapper functions
- **Value Objects**: Full integration with `@repo/domain` value objects (Amount, Price, etc.)
- **Testing**: Integration tests use Testcontainers with PostgreSQL for isolated database testing

## Testing Strategy

- **Unit Tests**: Fast tests without database dependencies
- **Integration Tests**: Use Testcontainers with real PostgreSQL instance
- **TestHelpers Class**: Internal test utilities for creating valid domain objects
- **Error Scenarios**: Comprehensive testing of validation and constraint errors
- **Test Isolation**: Each test runs against fresh database instance

## Dependencies

- **Runtime**: `@prisma/client`, `@repo/domain`, `@o3osatoshi/toolkit`, `neverthrow`
- **Development**: `prisma`, `testcontainers`, `@testcontainers/postgresql`, `vitest`
- **Node.js**: Requires Node.js >= 22 (specified in engines)

## Important Notes

- Always run `pnpm generate` after schema changes (automatic on postinstall)
- Repository implementations are in `src/adapters/` (Infrastructure layer)
- Prisma client uses singleton pattern with global caching in development
- Integration tests require Docker for Testcontainers
- Database operations are environment-aware using dotenv-cli
- Generated client files should never be edited manually
- Schema is configured to output to `generated/prisma` directory