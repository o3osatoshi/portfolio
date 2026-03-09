# RichError Conventions

This document defines how `RichError` should be used across the monorepo.

## Purpose

`RichError` is the shared error contract for structured diagnostics, user-facing failures, and cross-layer error transport.

Use it to keep error handling consistent across packages and apps.

## When to Consult This Guide

Open this guide when a change introduces or updates any of the following:

- `RichError` creation or wrapping
- `details.action`, `reason`, or `hint` naming
- `kind` or `layer` classification
- serialized error payloads, logging, or transport contracts based on `RichError`

## Fields

- `code`: stable contract identifier for callers, tests, and transport.
- `kind`: high-level error category such as `Validation`, `Unauthorized`, or `BadGateway`.
- `layer`: where the error belongs conceptually, such as `Domain`, `Application`, `Presentation`, or `External`.
- `details.action`: the processing step that failed.
- `details.reason`: what failed.
- `details.hint`: what the caller or user should try next.

## `details.action`

### Rule

`details.action` names the failed processing step. It does not need to match the current function name exactly.

### Naming

- Use `PascalCase`.
- Use `Verb + Target`.
- Prefer a processing step name over an implementation detail.
- Update the action when the meaning of the step changes, not merely when a function is renamed.

### Good examples

- `AuthorizeScope`
- `DecodeOidcTokenResponseFromRefreshFlow`
- `ResolveCliRuntimeEnv`
- `FindTransactionById`
- `FetchExternalApi`

### Avoid

- stale names left behind after refactors
- vague names such as `HandleError` or `DoThing`
- names that describe the caller rather than the failed step

### Common vocabulary

- `Parse*`: parse raw or schema-bound input into typed local input.
- `Decode*`: decode already-structured data into a typed value.
- `Deserialize*`: deserialize raw body, JSON, or transport payloads.
- `Fetch*`: perform an outbound HTTP request.
- `Read*`: read cookies, response text, token stores, cache entries, or similar local data.
- `Load*`: load files or file-like resources.
- `Resolve*`: resolve env, config, or runtime values.
- `Create*`, `Update*`, `Delete*`, `Find*`, `Check*`, `Verify*`, `Authorize*`, `Consume*`, `Write*`, `Clear*`, `Flush*`, `Emit*`, `Retry*`, `Run*`: use these directly when they describe the failed processing step clearly.

## `reason` and `hint`

- `reason` should explain the failure itself.
- `hint` should explain a likely next action.
- Do not use `hint` to restate `reason`.

Examples:

- `reason`: `Authorization header is missing.`
- `hint`: `Send a Bearer token and retry.`

## `kind` and `layer`

- `kind` describes the type of failure.
- `layer` describes where the failure belongs in the architecture.

Use the most specific values that remain stable and understandable to readers outside the package where the error originated.

## Practical guidance

- Prefer stable action names that remain useful in logs and serialized errors.
- Do not treat `details.action` as a one-to-one mirror of a function name.
- When wrapping lower-level errors, keep the action aligned with the step that failed in the current layer.
