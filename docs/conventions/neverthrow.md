# neverthrow Conventions

This document defines how `neverthrow` should be used across the monorepo.

## Purpose

Use `neverthrow` to make success and failure flow explicit, especially across validation, I/O, and service boundaries.

## When to Consult This Guide

Open this guide when a change introduces or updates any of the following:

- `Result` or `ResultAsync` control flow
- `map`, `mapErr`, `andThen`, `orElse`, `andTee`, or `orTee`
- `ok`, `err`, `okAsync`, or `errAsync` branching choices
- refactors that move side effects, fallbacks, or error remapping inside a result chain

## Core operators

- `map`: transform a success value.
- `mapErr`: transform an error value.
- `andThen`: continue with the next fallible step.
- `orElse`: recover from, remap, or clean up after an error.
- `andTee`: run success-side effects without changing the success value.
- `orTee`: run error-side effects without changing the error value.

## Value lifting

- Use `ok` / `err` for synchronous branches.
- Use `okAsync` / `errAsync` only when returning an asynchronous result boundary.

If the callback is synchronous, prefer `ok` / `err` even inside a `ResultAsync` chain.

## Standard usage rules

### `map`

Use `map` only for success-value transformation.

Good:

```ts
result.map((user) => user.id)
```

Avoid using `map` only to trigger side effects.

### `andThen`

Use `andThen` when the next step can fail and returns `Result` or `ResultAsync`.

```ts
parseInput(input).andThen((parsed) => save(parsed))
```

### `orElse`

Use `orElse` for error recovery, cleanup, fallback values, or error remapping.

```ts
readCache().orElse(() => ok(null))
```

### `andTee` / `orTee`

Use these for side effects that should not change the main success/error value.

```ts
result
  .andTee(() => {
    printSuccessMessage("Done.");
  })
  .map(() => undefined)
```

## Agreed anti-patterns

Avoid these patterns unless there is a concrete reason:

- running side effects inside `map`
- `asyncAndThen((value) => okAsync(value))`
- returning `okAsync(null)` or `okAsync(undefined)` for a purely synchronous fallback

## Practical guidance

- Prefer the smallest operator that matches the intent.
- Keep railway-style chains readable by separating transformation, fallible continuation, recovery, and side effects.
- Use `andTee` / `orTee` to make observation and logging clearly distinct from business flow.
