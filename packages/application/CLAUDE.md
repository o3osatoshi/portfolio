# CLAUDE.md - Application Package

This file provides guidance for the `@repo/application` package - the application layer in our Clean Architecture implementation.

## Package Overview

The application layer orchestrates the flow of data to and from the entities, and directs those entities to use their business rules to achieve the goals of the application.

## Package Structure

- **src/use-cases/**: Application use cases (business workflows)
  - **user/**: User-related use cases
    - **get-transactions.ts**: Retrieve user transactions
    - **register-transaction.ts**: Create new transaction
    - **update-transaction.ts**: Modify existing transaction
    - **delete-transaction.ts**: Remove transaction
- **src/services/**: Application services for coordination logic

## Clean Architecture Role

### Application Layer Responsibilities
- **Use Cases**: Implement application-specific business workflows
- **Orchestration**: Coordinate between domain entities and external services
- **Data Flow**: Transform data between external interfaces and domain models
- **Transaction Boundaries**: Define operation boundaries and rollback scenarios

### Dependencies
- **Depends On**: Domain layer (`@repo/domain`) for entities and interfaces
- **Depended By**: Infrastructure and presentation layers
- **Implements**: Application-specific workflows using domain entities

## Development Commands

**Build the package:**
```bash
pnpm build    # Build with TypeScript compiler
pnpm dev      # Watch mode for development
```

**Testing:**
```bash
pnpm test     # Run use case tests
```

**Clean up:**
```bash
pnpm clean    # Remove dist directory
```

## Use Case Patterns

### Structure
```typescript
export class GetTransactionsUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort
  ) {}

  async execute(userId: string): Promise<Result<Transaction[], Error>> {
    return this.transactionRepository.findByUserId(userId);
  }
}
```

### Key Principles
- **Dependency Injection**: Accept repository interfaces in constructors
- **Result Pattern**: Return Results for error handling consistency
- **Single Responsibility**: Each use case handles one business workflow
- **Framework Agnostic**: No web, database, or UI framework dependencies

## Error Handling

- Use `neverthrow` Result pattern consistently
- Chain operations with `andThen` for sequential logic
- Map errors to application-specific error types when needed
- Propagate domain errors up to the presentation layer

## Testing Strategy

- **Unit Tests**: Mock repository interfaces for isolated testing
- **Integration Tests**: Test use case flows with real repositories
- **Edge Cases**: Test error scenarios and validation failures

## Important Notes

- **No Direct Database Access**: Always use repository interfaces
- **Domain First**: Leverage domain entities for business logic
- **Stateless**: Use cases should be stateless and reusable
- **Validation**: Input validation should happen at this layer
