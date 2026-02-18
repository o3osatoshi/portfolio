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
o3o auth whoami
o3o tx list
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

For PKCE login, register this callback URL in Auth0:

```bash
http://127.0.0.1:38080/callback
```
