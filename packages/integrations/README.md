# @repo/integrations

Integrations layer for external services and HTTP adapters used by the
portfolio monorepo. This package wires fetch, retry, caching, and logging
around external calls without owning domain or application logic.

## Purpose and boundaries
- Integrations depend on domain ports (for example `CacheStore`), not the other way around.
- External providers live here; domain and application logic stay elsewhere.
- Errors are shaped via `newIntegrationError` when this layer creates new errors.

## Package structure
- `src/http`: base fetch + smart fetch composition + middleware.
- `src/exchange-rate-api`: ExchangeRate API provider implementation.
- `src/upstash`: Upstash Redis cache adapters (node and edge).
- `src/integration-error.ts`: integrations error helper.

## HTTP stack

### createBaseFetch
`createBaseFetch` is a thin wrapper around `fetch` that:
- Applies timeout/abort handling via `resolveAbortSignal`.
- Deserializes JSON responses when present.
- Normalizes responses into `HttpResponse`.
- Uses `newFetchError` (toolkit) for network/deserialize failures.

### createSmartFetch
`createSmartFetch` composes base fetch with optional middleware:
- `retry` (global defaults or request overrides)
- `cache` (requires a `CacheStore` instance)
- `logging` (requires a `Logger` instance)

Requests must include a `decode` schema (Zod), and decode errors are normalized
through toolkit error helpers.

### Retry behavior
- Enable defaults: `createSmartFetch({ retry: true })`
- Override defaults: `createSmartFetch({ retry: { maxAttempts: 5 } })`
- Request-level overrides live on `request.retry`
- Defaults are conservative: GET/HEAD/OPTIONS only, retryable status codes,
  exponential backoff with jitter, and `Retry-After` support

### Cache behavior
- Cache is opt-in per request via `request.cache`
- `getKey` is required to enable caching for a request
- `shouldCache` defaults to `response.ok`
- TTL is resolved as `request.cache.ttlMs ?? options.ttlMs`

### Logging behavior
- Emits metrics for all requests
- Logs warn on 4xx responses and client-like error kinds
- Logs error on 5xx responses and server-like error kinds
- `request.logging` accepts `requestName` and `redactUrl`

## Errors and conventions
- Use `newIntegrationError` when constructing new errors in this layer.
- External adapters should include `action`, `kind`, and `reason`.
- Retry exhaustion uses `newIntegrationError` only when no upstream error exists;
  otherwise the original error is preserved.

## Usage

### Basic fetch
```ts
import { createSmartFetch } from "@repo/integrations";
import { z } from "zod";

const client = createSmartFetch({ retry: true });

const schema = z.object({ ok: z.boolean() });
const result = await client({
  decode: { schema },
  url: "https://example.test",
});
```

### With cache and logging
```ts
import { createSmartFetch } from "@repo/integrations";
import { z } from "zod";

const client = createSmartFetch({
  cache: { store: cacheStore },
  logging: { logger },
  retry: true,
});

const schema = z.object({ value: z.string() });
const result = await client({
  cache: { getKey: () => "cache:key" },
  decode: { schema },
  logging: { requestName: "example_api" },
  url: "https://example.test",
});
```

## Adapters
- `ExchangeRateApi`: external FX quote provider with cache + logging enabled.
- `wrapUpstashRedis`: Upstash Redis adapter that implements `CacheStore`.
- `redis.node` / `redis.edge`: runtime-specific Upstash clients.

## Scripts
Run from the repo root:
- `pnpm -C packages/integrations test`
- `pnpm -C packages/integrations typecheck`

## Requirements
- Node 22.x

## Notes
- This package depends on `@repo/domain` ports and `@o3osatoshi/toolkit`.
- Caching requires a `CacheStore` implementation (see Upstash adapter).
