# @o3osatoshi/cli

Official `o3o` command-line interface for authentication and transaction CRUD.

## Requirements

- Node.js `22.x`
- Access to an OIDC/Auth0 tenant configured for the o3o API

## Install

```bash
npm i -g @o3osatoshi/cli
```

After installation, the command is available as:

```bash
o3o
```

## Quick Start

1. Install the CLI.
2. Login.
3. Run transaction commands.

```bash
o3o auth login --mode auto
o3o auth whoami
o3o --output json tx list
```

By default, the CLI uses built-in runtime settings for the standard o3o environment, so no environment variables are required for normal usage.

## Output Modes

Global output option:

```bash
o3o --output text ...
o3o --output json ...
```

When `--output` is omitted, output mode is selected automatically:

- Interactive terminal (TTY): `text`
- Non-interactive environment (Codex/CI/pipes): `json`

## Codex / Automation First Usage

For tool-driven execution (Codex, CI, scripts), use `--output json`:

```bash
o3o --output json auth whoami
o3o --output json tx list
o3o --output json tx create --type BUY --datetime 2026-01-01T00:00:00.000Z --amount 1 --price 100 --currency USD
o3o --output json tx delete --id <id> --yes
```

JSON contract (`v1`):

- Success: `{"ok":true,"command":"...","value":...,"message":"...","meta":{"version":1}}`
- Error: `{"ok":false,"error":{"code":"...","kind":"...","layer":"...","message":"...","reason":"..."},"meta":{"version":1}}`

Notes:

- `value` is the machine-readable payload.
- `message` is optional summary text for humans.
- `tx delete` requires `--yes` in JSON mode / non-interactive mode.
- In JSON mode, stdout contains only machine-readable JSON (informational prompts go to stderr).

## Authentication

`o3o auth login` supports three modes via `--mode`:

- `auto` (default): PKCE first, then falls back to Device Flow when PKCE is unavailable.
- `pkce`: force browser + localhost callback.
- `device`: force Device Authorization Flow.

```bash
o3o auth login --mode auto
o3o auth login --mode pkce
o3o auth login --mode device
```

For PKCE with the default port, register this callback URL in your OIDC app:

```text
http://127.0.0.1:38080/callback
```

If your local callback port differs, update the callback URL accordingly.

For local development, you can switch runtime settings with an env file:

```bash
o3o --env-file .env.local auth login --mode auto
o3o --env-file .env.local tx list
```

### Environment Variables

`o3o` supports the following runtime env vars:

- `O3O_OIDC_ISSUER` (optional, default: built-in issuer)
- `O3O_OIDC_CLIENT_ID` (optional, default: built-in client id)
- `O3O_OIDC_AUDIENCE` (optional, default: built-in audience)
- `O3O_OIDC_REDIRECT_PORT` (optional, default: `38080`)
- `O3O_API_BASE_URL` (optional, default: built-in API base URL, query/hash are not allowed)
- `O3O_ENV_FILE` (optional path, used when `--env-file` is not provided)
- `O3O_TOKEN_STORE_BACKEND` (optional enum: `auto | file | keychain`, default: `auto`)
- `O3O_ALLOW_FILE_TOKEN_STORE` (optional enum: `0 | 1`, default: `0`)

Rules:

- Unset optional env vars fall back to defaults.
- If an enum env var is set to an invalid value, CLI exits with a config validation error.

## Commands

### Basic

```bash
o3o --help
o3o [--output text|json] [--env-file <path>] ...
o3o auth login [--mode auto|pkce|device]
o3o auth whoami
o3o auth logout
```

### Transactions

```bash
o3o tx list
o3o tx create --type BUY|SELL --datetime <iso> --amount <num> --price <num> --currency <code> [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]
o3o tx update --id <id> [--type BUY|SELL] [--datetime <iso>] [--amount <num>] [--price <num>] [--currency <code>] [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]
o3o tx delete --id <id> [--yes]
```

## Token Storage

- By default, login sessions are stored in the OS secure credential store (Keychain / Credential Manager / Secret Service).
- When secure storage is unavailable, auth commands fail with a storage error instead of silently downgrading storage.
- `o3o auth logout` clears local token state.

## Development Testing

For package-local development:

```bash
pnpm -C packages/cli test
pnpm -C packages/cli typecheck
pnpm -C packages/cli test:int
```

`test:int` runs subprocess-based integration tests against mock OIDC/API servers, so it does not require a real Auth0 tenant or running `apps/web`.

## Troubleshooting

- `Callback URL mismatch`
  - Ensure Auth0/OIDC callback URL exactly matches `http://127.0.0.1:<port>/callback`.
- `Required scope is missing: transactions:read` / `transactions:write`
  - Ensure your API permissions/scopes are granted to the authenticated user.
- `Unauthorized. Please run o3o auth login.`
  - Re-run `o3o auth login --mode auto`, then retry the command.
- `tx delete requires --yes in non-interactive mode.`
  - Add `--yes` when running from Codex/CI/shell automation.
- `Secure token storage (OS keychain) is unavailable`
  - If you explicitly accept file-based token storage for this environment, run with `O3O_ALLOW_FILE_TOKEN_STORE=1`.
