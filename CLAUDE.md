# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Turborepo monorepo with a Next.js portfolio application, Firebase functions, Storybook component library, and shared packages:

### Apps
- **web**: Next.js 15 portfolio app with authentication (NextAuth.js), Web3 integration (RainbowKit/Wagmi), and Prisma database
- **functions**: Firebase Cloud Functions for serverless backend logic  
- **storybook**: Component library documentation and testing

### Packages
- **@repo/prisma**: Prisma ORM setup with schema, client, and seeding utilities
- **@repo/ui**: Shared React components built with Tailwind CSS and shadcn/ui
- **@repo/tsrc**: Shared TypeScript configurations
- **@repo/ethereum**: Web3/Ethereum contract integration utilities

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
pnpm check      # Run Biome linting and formatting checks
pnpm check:fix  # Auto-fix Biome issues
```

**Database operations:**
```bash
pnpm db:migrate:dev    # Run development migrations
pnpm db:migrate:deploy # Deploy migrations to production
pnpm db:push          # Push schema changes without migrations
pnpm db:seed          # Seed database with test data
```

**Firebase functions:**
```bash
pnpm deploy:functions  # Build and deploy functions to Firebase
```

## Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Prisma adapter
- **Database**: Prisma ORM (configured for multiple environments)
- **Web3**: RainbowKit, Wagmi, Viem for Ethereum integration
- **Backend**: Firebase Cloud Functions
- **Code Quality**: Biome for linting/formatting
- **Package Manager**: pnpm with workspace configuration

## Important Notes

- Uses Node.js >= 22 as specified in package.json engines
- Database schema is located in `packages/database/prisma/`
- Environment variables need to be set up for database connection and auth
- Firebase project configuration is in `firebase.json`
- Turbo configuration handles task dependencies and caching in `turbo.json`