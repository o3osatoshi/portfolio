# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Turborepo monorepo with a Next.js portfolio application, Firebase functions, Storybook component library, and shared packages:

### Apps
- **web**: Next.js 15 portfolio app with authentication (NextAuth.js), Web3 integration (RainbowKit/Wagmi), and Prisma database
- **functions**: Firebase Cloud Functions for serverless backend logic  
- **storybook**: Component library documentation and testing

### Packages
- **@repo/application**: Application layer with use cases and services (Clean Architecture)
- **@repo/domain**: Domain entities, repositories, and value objects (Clean Architecture core)
- **@repo/prisma**: Infrastructure layer with Prisma ORM, database adapters, and utilities
- **@repo/ui**: Shared React components built with Tailwind CSS and shadcn/ui
- **@repo/eth**: Web3/Ethereum contract integration utilities with Wagmi
- **@repo/validation**: Shared Zod validation schemas and utilities
- **@repo/toolkit**: Shared utilities, error handling, and helper functions
- **@repo/tsrc**: Shared TypeScript configurations

## Development Commands

**Start development servers:**
```bash
pnpm dev  # All apps in development mode
```

**Build project:**
```bash
pnpm build  # Build all apps and packages
pnpm build:functions  # Build functions only
```

**Code quality:**
```bash
pnpm lint      # Run Biome linting and formatting checks
pnpm lint:fix  # Auto-fix Biome issues
```

**Database operations:**
```bash
pnpm db:migrate:dev    # Run development migrations
pnpm db:migrate:deploy # Deploy migrations to production
pnpm db:push          # Push schema changes without migrations
pnpm db:seed          # Seed database with test data
pnpm generate         # Generate Prisma client
```


**Firebase functions:**
```bash
pnpm deploy:functions  # Build and deploy functions to Firebase
```

## Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Prisma adapter
- **Database**: PostgreSQL with Prisma ORM (configured for multiple environments)
- **Web3**: RainbowKit, Wagmi v2 (canary), Viem for Ethereum integration
- **Backend**: Firebase Cloud Functions
- **Code Quality**: Biome for linting/formatting (double quotes, space indentation)
- **Package Manager**: pnpm with workspace configuration
- **Build System**: Turborepo with task dependencies and caching

## Important Architecture Notes

- Uses Node.js >= 22 as specified in package.json engines
- **Clean Architecture**: Domain-driven design with clear layer separation (domain → application → infrastructure)
- **Repository Pattern**: Database adapters implement domain repository interfaces
- **Error Handling**: Centralized error types with neverthrow Result pattern
- Turbo tasks define environment variables needed for builds (DATABASE_URL, AUTH_SECRET, etc.)
- Firebase functions have predeploy hook that runs `pnpm build:functions`
- Each package may have its own CLAUDE.md file with package-specific guidance

## Testing Strategy

**Unit Tests:**
```bash
pnpm test          # Run all unit tests
pnpm test:watch    # Watch mode for unit tests
```

**Integration Tests:**
```bash
pnpm test:int      # Run integration tests (requires Docker for Testcontainers)
```