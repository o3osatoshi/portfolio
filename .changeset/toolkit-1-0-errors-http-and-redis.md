---
"@o3osatoshi/toolkit": major
---

Introduce new env/HTTP/Next.js/Redis helpers and refine error shaping semantics.

- Breaking: `ErrorHttpResponse` now exposes a `statusCode` field instead of `status`, and the `"Canceled"` kind maps to HTTP `408` (Request Timeout) rather than `499`; update any call sites that read `status` or rely on the previous non-standard status code.
- Breaking: error serialization no longer truncates messages by default and removes the internal `MESSAGE_FORMAT_VERSION` field from JSON payloads; if you depended on fixed-length messages or the `version` field, adjust consumers to handle full messages or use custom truncation.
- Added: new `env` helpers (`createEnv`, `EnvOf`) for validating environment variables with Zod and returning fully typed config objects, plus `json-codec` utilities for encoding/decoding JSON with structured `"InfraSerializationError"` failures.
- Added: `@o3osatoshi/toolkit/http` with a refined `toHttpErrorResponse` implementation and fetch-specific helpers (`newFetchError`, `formatFetchTarget`) for consistent classification of network/timeout failures as `"External*Error"` values.
- Added: `@o3osatoshi/toolkit/next` with `ActionState` utilities and `userMessageFromError` to derive user-facing copy from structured toolkit errors in Next.js Server Actions.
- Added: Upstash Redis utilities (`redis-client`, `redis-cache`) for creating Node/Edge clients and simple KV helpers, plus shared `types` / `zod` exports to centralize common JSON and Zod-related types.
- Improved: `newError` now attaches the original `cause` via native `ErrorOptions` (or a non-enumerable `cause` fallback), and several internal helpers were renamed or reorganized under `./error` and `./http` without changing their public import paths from `@o3osatoshi/toolkit`.

