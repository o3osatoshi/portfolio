[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/auth](../README.md) / createAuthConfig

# Function: createAuthConfig()

> **createAuthConfig**(`options`): [`AuthConfig`](../interfaces/AuthConfig.md)

Defined in: [packages/auth/src/hono-auth/index.ts:33](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/auth/src/hono-auth/index.ts#L33)

Compose an Auth.js configuration object for the Hono middleware.

This helper wires up the Prisma adapter (when provided), configures the
Google OAuth provider, and installs opinionated JWT / session callbacks
that persist a stable `user.id` onto the token.

## Parameters

### options

[`CreateAuthConfigOptions`](../type-aliases/CreateAuthConfigOptions.md)

High-level options for auth setup (providers, secret, etc.).

## Returns

[`AuthConfig`](../interfaces/AuthConfig.md)

Auth configuration object compatible with `@hono/auth-js`.
