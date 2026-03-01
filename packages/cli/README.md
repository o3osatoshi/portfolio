# @o3osatoshi/cli

Official `o3o` command-line interface for authentication and transaction CRUD.

## Requirements

- Node.js `22.x` or later
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

1. Configure runtime environment variables.
2. Login.
3. Run transaction commands.

```bash
export O3O_OIDC_ISSUER="https://<your-tenant>.us.auth0.com"
export O3O_OIDC_CLIENT_ID="<native-app-client-id>"
export O3O_OIDC_AUDIENCE="https://api.o3o.app"
export O3O_API_BASE_URL="https://<your-api-host>"
# optional (default: 38080)
export O3O_OIDC_REDIRECT_PORT="38080"

o3o auth login
o3o auth whoami
o3o tx list --json
```

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

If you change `O3O_OIDC_REDIRECT_PORT`, update the callback URL accordingly.

## Commands

### Basic

```bash
o3o hello
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

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `O3O_OIDC_ISSUER` | Yes | - | OIDC issuer URL |
| `O3O_OIDC_CLIENT_ID` | Yes | - | OIDC client ID for CLI native app |
| `O3O_OIDC_AUDIENCE` | Yes | - | API audience (for access token) |
| `O3O_API_BASE_URL` | Yes in production | `http://localhost:3000` (non-production only) | Base URL for API requests |
| `O3O_OIDC_REDIRECT_PORT` | No | `38080` | Local callback port for PKCE |

Compatibility fallback variables are supported:

- `AUTH_OIDC_ISSUER`
- `AUTH_OIDC_CLIENT_ID`
- `AUTH_OIDC_AUDIENCE`
- `PORTFOLIO_API_BASE_URL`

`O3O_*` takes precedence over fallback variables.

## Token Storage

- New login sessions are stored in `~/.config/o3o/auth.json`.
- The file is written with `0600` permissions (owner read/write only).
- `o3o auth logout` clears local token state.

## Troubleshooting

- `Callback URL mismatch`
  - Ensure Auth0/OIDC callback URL exactly matches `http://127.0.0.1:<port>/callback`.
- `Required scope is missing: transactions:read` / `transactions:write`
  - Ensure your API permissions/scopes are granted to the authenticated user.
- `Unauthorized. Please run o3o auth login.`
  - Re-run `o3o auth login`, then retry the command.
