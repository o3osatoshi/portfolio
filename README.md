# o3osatoshi

This is the personal portfolio website of **Satoshi Ogura**, showcasing my professional experience, technical skills, and ongoing experiments in software engineering and Web3 technologies.

🌐 **Live Site**: [https://o3osatoshi.engr.work](https://o3osatoshi.engr.work)

## Purpose

This portfolio serves two main purposes:

### Self-Introduction
- **Professional Background**: Experience in software engineering, blockchain development, and system architecture
- **Core Expertise**: Full-stack development, Web3 integration, cloud infrastructure, and developer tooling
- **Current Focus**: Exploring emerging technologies in AI, blockchain, and modern web development patterns
- **Blog & Content**: Technical writing and insights into software engineering practices ([Technical Blog](https://blog.o3osatoshi.engr.work/archives/#tag-coding))

### Technical Experimentation
This codebase serves as a living laboratory for:
- **Modern Web Technologies**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Web3 Integration**: RainbowKit, Wagmi, Viem for Ethereum interaction
- **Architecture Patterns**: Monorepo structure, modular design, serverless functions
- **Development Practices**: Code quality tools, CI/CD, testing strategies

**Technical Notes**: Detailed verification notes and implementation insights are documented on my [technical blog](https://blog.o3osatoshi.engr.work/archives/#tag-coding), while the actual source code implementations remain in this repository.

## Repository as Portfolio

This source code itself demonstrates:
- **Code Quality**: Consistent TypeScript usage, comprehensive linting/formatting
- **Architecture Design**: Clean separation of concerns, scalable monorepo structure
- **Modern Tooling**: Latest frameworks, build tools, and development workflows
- **Operational Excellence**: Automated deployments, environment management, monitoring

## Technology Stack

### Core Technologies
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Prisma adapter
- **Database**: Prisma ORM with multi-environment support
- **Web3**: RainbowKit, Wagmi, Viem for Ethereum integration
- **Backend**: Firebase Cloud Functions
- **Monorepo**: Turborepo with pnpm workspaces

### Development Tools
- **Code Quality**: Biome for linting and formatting
- **Package Manager**: pnpm with workspace configuration
- **Runtime**: Node.js >= 22
- **CI/CD**: Automated build and deployment pipelines

## Monorepo Structure

```
portfolio/
├── apps/
│   ├── web/              # Next.js portfolio application
│   ├── functions/        # Firebase Cloud Functions
│   └── storybook/        # Component library documentation
├── packages/
│   ├── @repo/database/   # Prisma ORM setup and utilities
│   ├── @repo/ui/         # Shared React components (Tailwind + shadcn/ui)
│   ├── @repo/ethereum/   # Web3/Ethereum integration utilities
│   └── @repo/typescript-config/  # Shared TypeScript configurations
└── turbo.json           # Turborepo task orchestration
```

## Quick Start

### Prerequisites
- Node.js >= 22
- pnpm package manager
- Docker (for local database)

### Local Development

1. **Clone and install dependencies**:
```bash
git clone https://github.com/o3osatoshi/portfolio.git
cd portfolio
pnpm install
```

2. **Start development servers**:
```bash
pnpm dev
```

This starts all applications in development mode:
- Portfolio site: `http://localhost:3000`
- Storybook: `http://localhost:6006`

### Key Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm build           # Build all apps and packages

# Code Quality
pnpm check           # Run Biome linting and formatting checks
pnpm check:fix       # Auto-fix Biome issues

# Database Operations
pnpm db:migrate:dev     # Run development migrations
pnpm db:migrate:deploy  # Deploy migrations to production
pnpm db:push           # Push schema changes without migrations
pnpm db:seed           # Seed database with test data

# Deployment
pnpm deploy:functions   # Build and deploy Firebase functions
```

## Deployment & Hosting

### Production Environment
- **Frontend**: Deployed on modern hosting platform with automatic deployments
- **Backend**: Firebase Cloud Functions for serverless API endpoints
- **Database**: Production database with automated backups and monitoring
- **Domain**: Custom domain with SSL/TLS encryption

### Environment Variables
Key environment variables required for deployment:
- Database connection strings
- Authentication provider credentials
- Web3 provider endpoints
- Firebase project configuration

## Development Highlights

This project showcases modern development practices:

- **Type Safety**: 100% TypeScript with strict type checking
- **Component Architecture**: Reusable UI components with Storybook documentation
- **Database Design**: Normalized schema with efficient query patterns
- **Web3 Integration**: Secure wallet connections and blockchain interactions
- **Performance**: Optimized builds, code splitting, and caching strategies
- **Testing**: Comprehensive test coverage with modern testing frameworks

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact & Connect

Prefer to connect via social media:

- **LinkedIn**: [Satoshi Ogura](https://www.linkedin.com/in/satoshi-ogura-189479135) - Professional networking and career discussions
- **X (Twitter)**: [@o3osatoshi](https://x.com/o3osatoshi) - Technical discussions and updates
