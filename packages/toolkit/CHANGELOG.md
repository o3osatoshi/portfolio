# @o3osatoshi/toolkit

## 1.1.0

### Minor Changes

- [#54](https://github.com/o3osatoshi/portfolio/pull/54) [`d2efb58`](https://github.com/o3osatoshi/portfolio/commit/d2efb580b2bf66ad97014d549c462e20da49aed2) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - - Add `Env` plus JSON value types and Zod schemas for consistent runtime typing.
  - Introduce `createLazyEnv` for deferred environment validation with immutability guards.
  - Improve error message extraction and serialization with `coerceErrorMessage`.
  - Document `tsup --watch --no-clean` behavior for dev workflows.

## 1.0.0

### Major Changes

- [#47](https://github.com/o3osatoshi/portfolio/pull/47) [`ff2b6e3`](https://github.com/o3osatoshi/portfolio/commit/ff2b6e3a65ba1cdc8bfec07ff0939aa535fcc44e) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - Introduce new env/HTTP/Next.js/Redis helpers and refine error shaping semantics.
  - Breaking: `ErrorHttpResponse` now exposes a `statusCode` field instead of `status`, and the `"Canceled"` kind maps to HTTP `408` (Request Timeout) rather than `499`; update any call sites that read `status` or rely on the previous non-standard status code.
  - Breaking: error serialization no longer truncates messages by default and removes the internal `MESSAGE_FORMAT_VERSION` field from JSON payloads; if you depended on fixed-length messages or the `version` field, adjust consumers to handle full messages or use custom truncation.
  - Added: new `env` helpers (`createEnv`, `EnvOf`) for validating environment variables with Zod and returning fully typed config objects, plus `json-codec` utilities for encoding/decoding JSON with structured `"InfraSerializationError"` failures.
  - Added: `@o3osatoshi/toolkit/http` with a refined `toHttpErrorResponse` implementation and fetch-specific helpers (`newFetchError`, `formatFetchTarget`) for consistent classification of network/timeout failures as `"External*Error"` values.
  - Added: `@o3osatoshi/toolkit/next` with `ActionState` utilities and `userMessageFromError` to derive user-facing copy from structured toolkit errors in Next.js Server Actions.
  - Added: Upstash Redis utilities (`redis-client`, `redis-cache`) for creating Node/Edge clients and simple KV helpers, plus shared `types` / `zod` exports to centralize common JSON and Zod-related types.
  - Improved: `newError` now attaches the original `cause` via native `ErrorOptions` (or a non-enumerable `cause` fallback), and several internal helpers were renamed or reorganized under `./error` and `./http` without changing their public import paths from `@o3osatoshi/toolkit`.

## 0.1.0

### Minor Changes

- [#17](https://github.com/o3osatoshi/portfolio/pull/17) [`cb7dbcc`](https://github.com/o3osatoshi/portfolio/commit/cb7dbcc30b6a260d4a68d91fdd52898d8f37a9ea) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - Release summary (since 0.0.3 on Sep 22)
  - Added: `sleep` with AbortSignal and `ResultAsync`; `newFetchError` with overrideable classification; `toHttpErrorResponse`; error serialization/deserialization utilities; `truncate` string helper.
  - Improved: error kind detection and HTTP status mapping; message formatting; Zod error utils; consolidated exports and docs.
  - No breaking changes expected for public APIs.

## 0.0.3

### Patch Changes

- [`9e38d97`](https://github.com/o3osatoshi/portfolio/commit/9e38d974325ac83433609670b6bc2ecc803c6050) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - release test

## 0.0.2

### Patch Changes

- [`bc9ed90`](https://github.com/o3osatoshi/portfolio/commit/bc9ed90a7831a8d366984fad24c2f087b478f1f8) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - release test

## 0.0.1

### Patch Changes

- [`fd705ac`](https://github.com/o3osatoshi/portfolio/commit/fd705acbd21d8485a96ce840f954947e9bd8d27e) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - initial publish
