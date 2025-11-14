# @repo/edge — Cloudflare Worker (Edge)

This package contains the Cloudflare Worker that exposes the public HTTP API for the portfolio. It wires the runtime-specific bits (Workers) to the shared HTTP app from `@repo/interface/http/edge`.

## Overview
- Runtime: Cloudflare Workers (Wrangler v4)
- Entry: `src/index.ts` → exports the Hono app from `@repo/interface/http/edge`
- Config: `wrangler.jsonc` (name, main, compatibility_date, minify)
- Base path: `/edge` (provided by the shared interface app)

## Prerequisites
- Node.js >= 22 and pnpm installed
- Cloudflare account + `wrangler` CLI authenticated (`wrangler whoami`)
- `doppler` CLI authenticated (service token or login)
- `jq` installed (used to shape secret payloads)

## Scripts
The following scripts are available (mirrors `package.json`):

```bash
# Start local dev server (Cloudflare Workers)
pnpm -C apps/edge dev

# Produce a local bundle without deploying (writes to ./dist)
pnpm -C apps/edge build

# Deploy the Worker
pnpm -C apps/edge run deploy

# Upload a preview version (Wrangler versions API)
pnpm -C apps/edge run deploy:prv

# Sync secrets from Doppler to Cloudflare (bulk upload)
pnpm -C apps/edge sync:env
```

You can also invoke root-level shortcuts:

```bash
# Deploy from repo root
pnpm deploy:edge
```

## Configuration
`wrangler.jsonc` pins the Workers runtime and defines the script name:

```jsonc
{
  "$schema": "https://developers.cloudflare.com/workers/wrangler/configuration/schema.json",
  "compatibility_date": "2025-11-02",
  "main": "src/index.ts",
  "minify": true,
  "name": "portfolio-edge"
}
```

If you need multiple environments (e.g., staging vs production), add `env` blocks and pass `--env <name>` to relevant commands (including `secret bulk`).

## Secrets and environment
Secrets are synchronized from Doppler and uploaded to Cloudflare with a pipeline:

```bash
# Defined as the sync:env script
doppler secrets --json --project portfolio-edge --config prd \
  | jq -c 'with_entries(.value = .value.computed)' \
  | wrangler secret bulk
```

Notes:
- Cloudflare secret names must match `^[A-Z0-9_]+$`.
- If you split environments, use `wrangler secret bulk --env <name>`.
- First-time setup: deploy the Worker once before running `sync:env`.
  - Wrangler’s API requires the “latest version” to be deployed before editing settings (including secrets).

## Local development
```bash
pnpm -C apps/edge dev
# Default port is shown by wrangler; typical URL: http://localhost:8787
```

Hit the API:
```bash
curl -i http://localhost:8787/edge/public/healthz
```

## Deployment
```bash
# First-time (creates the script) — required before bulk secret upload
pnpm deploy:edge

# Then sync secrets
pnpm -C apps/edge sync:env
```

## API surface
The shared interface app mounts these routes under `/edge`:
- `GET /edge/public/healthz` → `{ ok: true }`
- `GET /edge/private/me` → Authenticated user info (requires valid Auth.js session)

## Troubleshooting
- Error 10214 (“latest version isn't currently deployed”):
  - Run `pnpm deploy:edge` once, then `pnpm -C apps/edge sync:env`.
- Unauthorized or account mismatch:
  - `wrangler whoami` and ensure the correct account is selected.
- Doppler errors:
  - Ensure `doppler configure` is complete or a service token is set.
- Secret name validation:
  - Ensure keys match `^[A-Z0-9_]+$`; transform with `jq` if needed.
