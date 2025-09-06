# CLAUDE.md - Domain Package

This file provides guidance for the `@repo/domain` package - the core domain layer in our Clean Architecture implementation.

## Package Overview

The domain package contains the business logic core of the application, independent of any external frameworks, databases, or UI concerns. It implements Clean Architecture principles with comprehensive value objects, entities, and repository contracts.

## Package Structure

- **src/entities/**: Domain entities representing core business objects
  - **base.ts**: Base entity with common properties (createdAt, updatedAt)
  - **transaction.ts**: Transaction entity with factory functions and validation
  - **index.ts**: Entity exports
- **src/ports/**: Port interfaces (repository abstractions)
  - **transaction.repository.ts**: TransactionRepository interface with ResultAsync patterns
  - **index.ts**: Port exports
- **src/value-objects/**: Value objects for domain modeling with brand types
  - **brand.ts**: Generic brand utility for nominal typing
  - **ids.ts**: Branded ID types (TransactionId, UserId)
  - **currency.ts**: CurrencyCode value object with validation
  - **numeric.ts**: Numeric value objects (Amount, Price, Fee, ProfitLoss)
  - **datetime.ts**: DateTime value object with validation
  - **transaction-type.ts**: TransactionType enum value object
  - **decimal.ts**: DecimalString branded type utilities
  - **index.ts**: Value object exports
- **src/domain-error.ts**: Domain-specific error types and factories
- **src/index.ts**: Package entry point exporting all domain constructs

## Clean Architecture Principles

### Core Responsibilities
- **Entities**: Encapsulate business rules, validation, and factory functions
- **Value Objects**: Immutable branded types ensuring type safety and validation
- **Repository Interfaces**: Define data access contracts using Result patterns
- **Domain Services**: Handle cross-entity business logic (currently empty but available)
- **Error Types**: Domain-specific errors with validation and business rule violations

### Dependency Rule
- **Minimal Dependencies**: Only `@o3osatoshi/toolkit`, `decimal.js`, and `neverthrow`
- **Pure Business Logic**: Contains only business rules and domain knowledge
- **Interface Definitions**: Defines contracts that infrastructure layer implements
- **Framework Agnostic**: No web, database, or UI framework dependencies

## Development Commands

**Testing:**
```bash
pnpm test          # Run tests in watch mode
pnpm test:run      # Run all tests once
```

## Value Objects Architecture

### Brand Types
- **Type Safety**: Uses branded types to prevent primitive obsession
- **Validation**: Each value object includes validation logic
- **Immutability**: Value objects are immutable by design

### Key Value Objects
```typescript
// Brand utility for nominal typing
export type Brand<T, B extends string> = T & { readonly __brand: B };

// ID types
export type TransactionId = Brand<string, "TransactionId">;
export type UserId = Brand<string, "UserId">;

// Numeric types
export type Amount = Brand<string, "Amount">;
export type Price = Brand<string, "Price">;
export type Fee = Brand<string, "Fee">;

// Business types
export type CurrencyCode = Brand<string, "CurrencyCode">;
export type DateTime = Brand<Date, "DateTime">;
export type TransactionType = Brand<"BUY" | "SELL", "TransactionType">;
```

### Factory Functions
Each value object includes factory functions with validation:
```typescript
export function newAmount(value: unknown): Result<Amount, Error>
export function newCurrencyCode(value: unknown): Result<CurrencyCode, Error>
export function newDateTime(value: unknown): Result<DateTime, Error>
```

## Entity Patterns

### Transaction Entity
- **Factory Functions**: `newTransaction`, `createTransaction`, `updateTransaction`
- **Type Safety**: Uses value objects for all properties
- **Validation**: Comprehensive validation using Result.combine patterns
- **Immutability**: Pure functions for entity operations

### Entity Types
```typescript
export type Transaction = Base & {
  id: TransactionId;
  type: TransactionType;
  datetime: DateTime;
  amount: Amount;
  price: Price;
  currency: CurrencyCode;
  profitLoss?: ProfitLoss;
  fee?: Fee;
  feeCurrency?: CurrencyCode;
  userId: UserId;
};

export type CreateTransaction = Omit<Transaction, "id" | "createdAt" | "updatedAt">;
```

## Repository Interface

### Result Pattern Integration
```typescript
export interface TransactionRepository {
  create(transaction: CreateTransaction): ResultAsync<Transaction, Error>;
  findById(id: TransactionId): ResultAsync<Transaction | null, Error>;
  findByUserId(userId: UserId): ResultAsync<Transaction[], Error>;
  update(transaction: Transaction): ResultAsync<Transaction, Error>;
  delete(id: TransactionId, userId: UserId): ResultAsync<void, Error>;
}
```

## Error Handling

- **Domain Errors**: Custom error types with validation context
- **Result Pattern**: Consistent error handling using `neverthrow` Result types
- **Validation Errors**: Rich validation error messages with context
- **Error Factories**: Standardized error creation functions

## Testing Strategy

- **Unit Tests**: Comprehensive testing of value objects, entities, and factory functions
- **Validation Testing**: Test all validation rules and edge cases
- **Error Scenarios**: Test error handling and validation failures
- **Property-based Testing**: Test invariants and business rules
- **Vitest**: Fast unit testing with TypeScript support

## Dependencies

- **Runtime**: `@o3osatoshi/toolkit` (utilities), `decimal.js` (decimal arithmetic), `neverthrow` (Result pattern)
- **Development**: `@o3osatoshi/config`, `typescript`, `vitest`, `@types/node`
- **Node.js**: Requires Node.js >= 22 (specified in engines)

## Type Safety Features

- **Branded Types**: Prevent primitive obsession and type confusion
- **Nominal Typing**: Strong typing for domain concepts
- **Result Patterns**: Type-safe error handling throughout
- **Factory Validation**: All inputs validated at domain boundaries
- **Immutable Design**: Entities and value objects are immutable

## Important Notes

- **Value Object First**: All domain properties use value objects, not primitives
- **Factory Functions**: Always use factory functions for entity creation
- **Result Patterns**: All operations return Result types for error handling
- **No Build Step**: Package exports TypeScript source directly
- **Type Safety**: Full branded type coverage prevents runtime errors
- **Business Rules**: All validation and business logic centralized in domain
- **Clean Separation**: No infrastructure or UI concerns in domain layer
