# HTTP Conventions

This document defines how low-level HTTP helpers should be shared across the monorepo.

## Purpose

Keep transport execution, response reading, and generic HTTP error normalization consistent across packages without pushing delivery-specific orchestration into shared layers.

## When to Consult This Guide

Open this guide when a change introduces or updates any of the following:

- low-level fetch primitives
- response body readers or JSON decoding helpers
- generic non-2xx response normalization
- package-local HTTP helpers in `packages/cli` or `packages/integrations`

## Canonical Source

`@o3osatoshi/toolkit/http` is the canonical source for low-level HTTP primitives.

Use `toolkit` for:

- transport execution
- request init shaping
- response text or JSON reading
- generic HTTP status-to-kind mapping
- generic non-2xx error normalization based on response status and payload

Do not duplicate those primitives in package-local helper modules unless a runtime constraint makes reuse impossible.

## Layer Boundaries

Keep these responsibilities in `toolkit`:

- `fetchResponse`
- `readResponseText`
- `readResponseJson`
- `decodeJsonText`
- `buildHttpErrorFromPayload`
- `buildHttpErrorFromResponse`
- `httpStatusToKind`

Keep these responsibilities out of `toolkit`:

- auth-aware request orchestration
- token refresh and 401 cleanup
- package-specific schema parsing policy
- provider-specific logical error handling
- API-contract-specific error decoding

Examples:

- `packages/cli` may keep `fetchJson`, `fetchAuthedJson`, and `fetchAuthenticatedApi`
- `packages/integrations` may keep `createBaseFetch`, `createSmartFetch`, retry, cache, and logging middleware
- OIDC device polling and API-specific error payload parsing stay local

## Design Rule

Shared helpers should expose low-level primitives.
Packages should compose those primitives into thin wrappers that match their own delivery or provider responsibilities.

Prefer this structure:

- `toolkit`: generic fetch primitive
- `integrations`: external service composition
- `cli`: delivery-specific composition

Avoid pushing higher-level orchestration back into `toolkit` just because multiple packages perform HTTP requests.

## Error Normalization

Generic non-2xx handling should follow one shared rule:

- transport and body-read failures become `RichError` directly
- non-2xx response payloads are normalized through the shared HTTP error builders
- extracted payload details belong in `details.reason` and `meta`
- synthesized payload diagnostics do not become `cause`

Package-local code may still override:

- top-level `code`
- top-level `details.action`
- package-specific fallback `reason`
- package-specific `kind` when logical provider semantics require it

## Vocabulary

Use fetch-oriented names for outbound transport:

- `fetch*` for outbound HTTP calls
- `read*` for response body reading
- `decode*` or `deserialize*` for parsing structured payloads

Do not use `request*` and `fetch*` interchangeably inside the same helper layer unless the distinction is intentional and documented.
