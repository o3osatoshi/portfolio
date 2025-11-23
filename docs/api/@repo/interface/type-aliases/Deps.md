[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / Deps

# Type Alias: Deps

> **Deps** = `object`

Defined in: [packages/interface/src/http/node/app.ts:27](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/http/node/app.ts#L27)

Dependencies required by [buildApp](../functions/buildApp.md).

Provide infrastructure-backed implementations in production (e.g. DB).

## Properties

### authConfig

> **authConfig**: [`AuthConfig`](../../auth/interfaces/AuthConfig.md)

Defined in: [packages/interface/src/http/node/app.ts:29](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/http/node/app.ts#L29)

Hono Auth.js configuration (see `@repo/auth#createAuthConfig`).

***

### transactionRepo

> **transactionRepo**: [`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

Defined in: [packages/interface/src/http/node/app.ts:31](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/http/node/app.ts#L31)

Repository required by transaction use cases.
