# @o3osatoshi/cli

o3o command line interface.

## Install

```bash
npm i -g @o3osatoshi/cli
```

## Commands

```bash
o3o hello
o3o auth login
o3o auth logout
o3o auth whoami

# Transactions
o3o tx list
o3o tx create --type BUY|SELL --datetime <iso> --amount <num> --price <num> --currency <code> [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]
o3o tx update --id <id> [--type BUY|SELL] [--datetime <iso>] [--amount <num>] [--price <num>] [--currency <code>] [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]
o3o tx delete --id <id> [--yes]
```

## Environment

Set runtime env vars before executing commands:

```bash
O3O_OIDC_ISSUER=...
O3O_OIDC_CLIENT_ID=...
O3O_OIDC_AUDIENCE=...
O3O_API_BASE_URL=...
O3O_OIDC_REDIRECT_PORT=38080
```

`O3O_*` vars are the primary CLI settings. `AUTH_OIDC_*` vars are accepted as a compatibility fallback.

For PKCE login, register this callback URL in Auth0:

```bash
http://127.0.0.1:38080/callback
```
