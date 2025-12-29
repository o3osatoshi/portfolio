# MSW usage (apps/web)

MSW is used only in the web app for local development and integration tests.
Storybook is intentionally excluded because components are props-first.

## Development (browser worker)

Enable the worker in `apps/web/.env.local`:

```
NEXT_PUBLIC_MSW=1
```

Optional controls:

```
NEXT_PUBLIC_MSW_SCENARIO=success|empty|unauthorized|error|delay
NEXT_PUBLIC_MSW_DELAY=600
```

Notes:
- `empty` is only used by the transactions list; other endpoints ignore it.
- `delay` uses per-endpoint defaults unless `NEXT_PUBLIC_MSW_DELAY` is set.

Per-request overrides (useful for manual fetches/cURL):
- Query: `?msw=unauthorized` or `?msw=delay&mswDelay=1200`
- Headers: `x-msw-scenario: error`, `x-msw-delay: 800`

## Tests (msw/node)

Vitest boots the MSW server automatically. Unhandled requests default to:
- `warn` locally
- `error` on CI

Override with:

```
MSW_ON_UNHANDLED_REQUEST=error|warn|bypass
```

In tests, you can always override handlers via `server.use(...)` from
`apps/web/src/mocks/server.ts`.
