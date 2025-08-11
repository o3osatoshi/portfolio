# Web App - CLAUDE.md

This file provides specific guidance for the Next.js portfolio web application within the monorepo.

## Application Structure

### Route Organization
- **App Router**: Uses Next.js 15 App Router with TypeScript
- **Route Groups**: 
  - `(main)/*` - Main application routes with sidebar layout
  - `api/*` - API routes for authentication and data endpoints
  - `signin/*` - Authentication pages

### Key Features
- **Portfolio Sections**: About, Blog pages under `/portfolio`
- **Labs Section**: Experimental features and demos
  - `limited-read/` - Reading functionality demo
  - `server-crud/` - Server-side CRUD operations with forms
  - `web3-crud/` - Web3/blockchain integration demo

## Authentication & Security

### NextAuth.js Integration
- **Provider**: Google OAuth configured in `lib/auth.config.ts`
- **Adapter**: Prisma adapter for database sessions
- **Middleware**: Edge-compatible auth middleware in `middleware.ts`
- **Session Strategy**: JWT-based sessions

### Protected Routes
Authentication middleware automatically protects routes based on configuration.

## Web3 Integration

### RainbowKit & Wagmi Setup
- **Network**: Configured for Holesky testnet
- **Wallet Connection**: RainbowKit UI components
- **State Management**: Wagmi hooks for blockchain interactions
- **Environment**: Requires `NEXT_PUBLIC_PROJECT_ID` for WalletConnect

## UI & Styling

### Component Architecture
- **Shared UI**: Uses `@repo/ui` workspace package
- **shadcn/ui**: Configured with "new-york" style variant
- **Theme System**: Dark/light mode with `next-themes`
- **Fonts**: Custom Google Fonts (Geist Sans/Mono, JetBrains Mono)

### Layout System
- **Sidebar Layout**: Main application uses sidebar navigation
- **Breadcrumbs**: Automatic breadcrumb generation
- **Responsive**: Mobile-friendly sidebar and navigation

## Development Specifics

### Build Configuration
```javascript
// next.config.mjs specifics:
- Transpiles @repo/ui package
- ESLint ignored during builds
- Prisma monorepo plugin for database access
```

### Database Integration
- **ORM**: Direct integration with `@repo/database` workspace
- **Actions**: Server actions in `_actions/` directories
- **Forms**: React Hook Form with Zod validation

### API Routes
- **Auth**: NextAuth.js handlers in `/api/auth/[...nextauth]`
- **Labs**: Custom API endpoints for experimental features

## Environment Variables

Required environment variables:
- `NEXTAUTH_URL` - Auth callback URL
- `NEXTAUTH_SECRET` - Auth encryption secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXT_PUBLIC_PROJECT_ID` - WalletConnect project ID
- Database connection variables (inherited from workspace)

## Development Commands (Web App Specific)

```bash
# Development
pnpm dev                 # Start Next.js dev server on port 3000

# Building
pnpm build              # Build for production
pnpm start              # Start production server

# Database operations (from workspace root)
pnpm db:push            # Push schema changes
pnpm db:seed            # Seed with test data
```

## File Conventions

### Component Organization
- **Route Components**: In `_components/` within route directories
- **Route Actions**: In `_actions/` for server actions
- **Route Services**: In `_services/` for data fetching logic
- **Global Components**: In `app/_components/`

### Import Aliases
```typescript
@/app/*          - App directory
@/lib/*          - Library utilities
@/components/*   - Local components
@repo/ui/*       - Shared UI components
```

## Testing & Quality

The web app inherits linting and formatting from the workspace-level Biome configuration. Run quality checks from workspace root:

```bash
pnpm check       # Check code quality
pnpm check:fix   # Auto-fix issues
```