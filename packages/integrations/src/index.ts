/**
 * @packageDocumentation
 * Public surface for external integrations (APIs, infrastructure adapters).
 *
 * Exports:
 * - HTTP fetch helpers (`smart-fetch`, `with-*` middlewares)
 * - Third-party integrations (`exchange-rate-api`, `oidc-user-info`, `slack`)
 * - Infrastructure adapters (`upstash`) and shared integration errors
 */
export * from "./auth/oidc-user-info";
export * from "./exchange-rate-api";
export * from "./http";
export * from "./integration-error";
export * from "./integration-error-catalog";
export * from "./slack";
export * from "./upstash";
