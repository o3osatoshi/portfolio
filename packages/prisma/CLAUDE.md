# CLAUDE.md - Prisma Package

This file provides Prisma-specific guidance for Claude Code when working with the database layer.

## Package Structure

- **prisma/**: Contains schema and migration files
  - **models/**: Modular schema files (users.prisma, transactions.prisma, etc.)
  - **migrations/**: Database migration history
  - **schema.prisma**: Main schema file that includes model files
- **src/**: TypeScript source code
  - **client.ts**: Prisma client configuration and export
  - **schemas/**: Zod validation schemas matching Prisma models
  - **seed.ts**: Database seeding script
- **generated/**: Prisma client generated files

## Development Commands

**Database operations:**
```bash
pnpm db:migrate:dev    # Run development migrations with .env.development.local
pnpm db:migrate:deploy # Deploy migrations to production with .env.production.local
pnpm db:push          # Push schema changes without creating migrations
pnpm db:seed          # Run database seeding script
```

**Prisma-specific:**
```bash
pnpm generate         # Generate Prisma client after schema changes
pnpm studio          # Open Prisma Studio for database browsing
pnpm format          # Format Prisma schema files
```

## Schema Architecture

- Uses modular schema files in `prisma/models/` directory
- Main `schema.prisma` includes model files using relative paths
- Generated client outputs to `generated/prisma` directory
- PostgreSQL database with connection via DATABASE_URL environment variable

## Environment Configuration

- **Development**: Uses `.env.development.local` for migrations
- **Production**: Uses `.env.production.local` for deployments
- Migrations are environment-specific using dotenv-cli

## Important Notes

- Always run `pnpm generate` after schema changes
- Modular schema files must be included in main `schema.prisma`
- Zod schemas in `src/schemas/` should match Prisma models for validation
- Database URL is configured via environment variables
- Client is exported from `src/client.ts` for use across the monorepo