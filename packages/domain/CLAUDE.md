# CLAUDE.md - Domain Package

This file provides guidance for the `@repo/domain` package - the core domain layer in our Clean Architecture implementation.

## Package Overview

The domain package contains the business logic core of the application, independent of any external frameworks, databases, or UI concerns.

## Package Structure

- **src/entities/**: Domain entities representing core business objects
  - **base.ts**: Base entity class with common properties
  - **transaction.ts**: Transaction business entity
- **src/ports/**: Port interfaces (abstractions)
  - **transaction-repository.port.ts**: TransactionRepositoryPort interface
- **src/services/**: Domain services for complex business logic
- **src/value-objects/**: Value objects for domain modeling

## Clean Architecture Principles

### Core Responsibilities
- **Entities**: Encapsulate business rules and data
- **Repository Interfaces**: Define contracts for data access without implementation details
- **Domain Services**: Handle business logic that doesn't belong to a single entity
- **Value Objects**: Immutable objects that describe aspects of the domain

### Dependency Rule
- **No External Dependencies**: This package should NOT depend on infrastructure, UI, or frameworks
- **Pure Business Logic**: Contains only business rules and domain knowledge
- **Interface Definitions**: Defines contracts that outer layers must implement

## Development Commands

**Build the package:**
```bash
pnpm build    # Build with TypeScript compiler
pnpm dev      # Watch mode for development
```

**Testing:**
```bash
pnpm test     # Run domain logic tests
```

**Clean up:**
```bash
pnpm clean    # Remove dist directory
```

## Key Patterns

### Entities
- Extend base entity class with common properties (id, createdAt, updatedAt)
- Encapsulate business rules and validation
- Should be framework-agnostic

### Repository Interfaces
- Define data access contracts using generic types
- Return `ResultAsync` from neverthrow for error handling
- Should be implemented by infrastructure layer

### Type Safety
- Export TypeScript types alongside entities
- Use branded types for enhanced type safety
- Leverage discriminated unions for business states

## Important Notes

- **Framework Independence**: Never import external frameworks or libraries except for utilities
- **Business Focus**: All code should represent business concepts and rules
- **Interface First**: Define interfaces before implementations
- **Error Handling**: Use Result types for operation outcomes
