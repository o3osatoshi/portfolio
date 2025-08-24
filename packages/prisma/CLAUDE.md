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
  - **prisma-client.ts**: Prisma client configuration and export
  - **prisma-error.ts**: Database-specific error handling
  - **index.ts**: Package entry point
- **generated/**: Prisma client generated files

## Development Commands

**Database operations:**
```bash
pnpm db:migrate:dev    # Run development migrations with .env.development.local
pnpm db:migrate:deploy # Deploy migrations to production with .env.production.local
pnpm db:push          # Push schema changes without creating migrations
pnpm db:seed          # Run database seeding script (scripts/seed.ts)
```

**Prisma-specific:**
```bash
pnpm generate         # Generate Prisma client after schema changes
pnpm studio          # Open Prisma Studio for database browsing
pnpm format          # Format Prisma schema files
```

**Testing:**
```bash
pnpm test             # Run unit tests
pnpm test:int         # Run integration tests with Testcontainers (requires Docker)
```

## Schema Architecture

- Uses modular schema files in `schema/models/` directory
- Main `schema.prisma` includes model files using relative paths
- Generated client outputs to `generated/prisma` directory
- PostgreSQL database with connection via DATABASE_URL environment variable

## Environment Configuration

- **Development**: Uses `.env.development.local` for migrations
- **Production**: Uses `.env.production.local` for deployments
- Migrations are environment-specific using dotenv-cli

## Clean Architecture Implementation

- **Repository Pattern**: Adapters implement domain interfaces from `@repo/domain`
- **Error Handling**: Uses `neverthrow` Result pattern with custom database errors
- **Type Safety**: Converts Prisma models to domain entities via mapper functions
- **Testing**: Integration tests use Testcontainers for isolated database testing

## Important Notes

- Always run `pnpm generate` after schema changes
- Modular schema files must be included in main `schema.prisma`
- Repository implementations are in `src/adapters/` (Infrastructure layer)
- Database URL is configured via environment variables
- Client is exported from `src/prisma-client.ts` for use across the monorepo
- Integration tests require Docker for Testcontainers