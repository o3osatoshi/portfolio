# CLAUDE.md - Application Package

This file provides guidance for the `@repo/application` package - the application layer in our Clean Architecture implementation.

## Package Overview

The application layer orchestrates the flow of data to and from the entities, and directs those entities to use their business rules to achieve the goals of the application.

## Package Structure

- **src/dtos/**: Data Transfer Objects for input/output validation
  - **transaction.req.dto.ts**: Request DTOs with Zod validation schemas
  - **transaction.res.dto.ts**: Response DTOs and transformation functions
  - **index.ts**: DTO exports
- **src/use-cases/**: Application use cases (business workflows)
  - **user/**: User-related use cases
    - **create-transaction.ts**: Create new transaction
    - **get-transactions.ts**: Retrieve user transactions
    - **update-transaction.ts**: Modify existing transaction
    - **delete-transaction.ts**: Remove transaction
    - **index.ts**: Use case exports
- **src/application-error.ts**: Application-specific error types
- **src/index.ts**: Package entry point exporting DTOs and use cases

## Clean Architecture Role

### Application Layer Responsibilities
- **Use Cases**: Implement application-specific business workflows
- **DTOs**: Input validation and data transformation between layers
- **Orchestration**: Coordinate between domain entities and external services
- **Data Flow**: Transform data between external interfaces and domain models
- **Input Validation**: Validate and parse incoming requests using Zod schemas

### Dependencies
- **Depends On**: Domain layer (`@repo/domain`) for entities and repository interfaces
- **Uses**: `@o3osatoshi/toolkit` for parsing utilities, `zod` for validation, `neverthrow` for Result patterns
- **Depended By**: Infrastructure and presentation layers
- **Implements**: Application-specific workflows using domain entities

## Development Commands

**Testing:**
```bash
pnpm test          # Run unit tests once
pnpm test:watch    # Run tests in watch mode
pnpm typecheck     # TypeScript type checking
```

## DTO Architecture

### Request DTOs
- **Zod Validation**: All request inputs validated with Zod schemas
- **Type Safety**: TypeScript types inferred from Zod schemas
- **Parsing Functions**: Standardized parsing with `@o3osatoshi/toolkit`

### Response DTOs
- **Domain Transformation**: Convert domain entities to API responses
- **Type Consistency**: Maintain type safety across layer boundaries
- **Serialization**: Ensure proper JSON serialization for external APIs

### Schema Examples
```typescript
const createTransactionRequestSchema = z.object({
  type: z.enum(["BUY", "SELL"]),
  datetime: z.coerce.date(),
  amount: PositiveDecimalSchema,
  price: PositiveDecimalSchema,
  currency: z.string().regex(/^[A-Z]{3}$/),
  userId: z.string().min(1)
});

export const parseCreateTransactionRequest = parseWith(
  createTransactionRequestSchema,
  { action: "ParseCreateTransactionRequest" }
);
```

## Use Case Patterns

### Structure
```typescript
export class CreateTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  execute(
    req: CreateTransactionRequest
  ): ResultAsync<CreateTransactionResponse, Error> {
    const res = createTransaction(req);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.create(res.value).map(toTransactionResponse);
  }
}
```

### Key Principles
- **Dependency Injection**: Accept repository interfaces in constructors
- **Result Pattern**: Return `ResultAsync` for async error handling consistency
- **Single Responsibility**: Each use case handles one business workflow
- **Framework Agnostic**: No web, database, or UI framework dependencies
- **DTO Integration**: Use request DTOs for input, response DTOs for output

## Error Handling

- Use `neverthrow` ResultAsync pattern for async operations
- Propagate domain validation errors through Result chains
- Transform domain entities using Result mapping
- Application-specific error types in `application-error.ts`

## Testing Strategy

- **Unit Tests**: Mock repository interfaces for isolated testing
- **DTO Testing**: Validate Zod schemas with comprehensive test cases
- **Use Case Testing**: Test complete workflows with mocked dependencies
- **Edge Cases**: Test error scenarios and validation failures
- **Vitest**: Uses Vitest for fast unit testing

## Dependencies

- **Runtime**: `@repo/domain`, `@o3osatoshi/toolkit`, `neverthrow`, `zod`
- **Development**: `@o3osatoshi/config`, `typescript`, `vitest`, `@types/node`
- **Node.js**: Requires Node.js >= 22 (specified in engines)

## Important Notes

- **DTO-First Design**: All external inputs validated through DTOs before domain layer
- **No Direct Database Access**: Always use repository interfaces from domain
- **Domain First**: Leverage domain entities for business logic
- **Stateless**: Use cases should be stateless and reusable
- **Type Safety**: Full TypeScript coverage with inferred types from Zod
- **Result Pattern**: Consistent error handling using neverthrow throughout
- **No Build Step**: Package exports TypeScript source directly
