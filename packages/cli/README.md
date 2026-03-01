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
o3o auth login
o3o auth whoami
o3o tx list --json
```

By default, the CLI uses built-in production runtime settings, so no environment variables are required for normal usage.

## Codex / Automation First Usage

For tool-driven execution (Codex, CI, scripts), use global JSON output:

```bash
o3o --output json auth whoami
o3o --output json tx list
o3o --output json tx create --type BUY --datetime 2026-01-01T00:00:00.000Z --amount 1 --price 100 --currency USD
o3o --output json tx delete --id <id> --yes
```

Behavior in JSON mode:

- Success: `{"ok":true,"command":"...","data":...,"meta":{"schemaVersion":"v1"}}` or `{"ok":true,"command":"...","message":"...","meta":{"schemaVersion":"v1"}}`
- Error: `{"ok":false,"error":{"code":"...","kind":"...","layer":"...","message":"...","reason":"..."},"meta":{"schemaVersion":"v1"}}`
- `tx delete` requires `--yes` (no interactive prompt in machine-oriented flows)

Default output mode is `auto`:

- Interactive terminal (TTY): text output
- Non-interactive environment (Codex/CI/pipes): JSON output

## Authentication

`o3o auth login` supports two modes:

- `auto` (default): PKCE first, then falls back to Device Flow when PKCE is unavailable.
- `pkce`: force browser + localhost callback.
- `device`: force Device Authorization Flow.

```bash
o3o auth login
o3o auth login --pkce
o3o auth login --device
```

For PKCE with the default port, register this callback URL in your OIDC app:

```text
http://127.0.0.1:38080/callback
```

If your local callback port differs, update the callback URL accordingly.

For local development, you can switch runtime settings with an env file:

```bash
o3o --env-file .env.local auth login
o3o --env-file .env.local tx list --json
```

## Commands

### Basic

```bash
o3o help
o3o hello
o3o [--output auto|text|json] ...
o3o auth login [--pkce|--device]
o3o auth whoami
o3o auth logout
```

### Transactions

```bash
o3o tx list [--json]
o3o tx create --type BUY|SELL --datetime <iso> --amount <num> --price <num> --currency <code> [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]
o3o tx update --id <id> [--type BUY|SELL] [--datetime <iso>] [--amount <num>] [--price <num>] [--currency <code>] [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]
o3o tx delete --id <id> [--yes]
```

## Token Storage

- By default, login sessions are stored in the OS secure credential store (Keychain / Credential Manager / Secret Service).
- When secure storage is unavailable, auth commands fail with a storage error instead of silently downgrading storage.
- `o3o auth logout` clears local token state.

## Troubleshooting

- `Callback URL mismatch`
  - Ensure Auth0/OIDC callback URL exactly matches `http://127.0.0.1:<port>/callback`.
- `Required scope is missing: transactions:read` / `transactions:write`
  - Ensure your API permissions/scopes are granted to the authenticated user.
- `Unauthorized. Please run o3o auth login.`
  - Re-run `o3o auth login`, then retry the command.
- `tx delete requires --yes in non-interactive mode.`
  - Add `--yes` when running from Codex/CI/shell automation.
- `Secure token storage (OS keychain) is unavailable`
  - If you explicitly accept file-based token storage for this environment, run with `O3O_ALLOW_FILE_TOKEN_STORE=1`.
