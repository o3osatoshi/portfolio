/**
 * @packageDocumentation
 * Public Hono-auth API surface for `@repo/auth`.
 *
 * This module re-exports:
 * - token guards and principal resolvers
 * - auth configuration factory (`createAuthConfig`)
 * - OIDC verifier helpers and shared schema/type aliases
 * - raw JWT helpers used by auth-aware middleware
 */
export * from "./access-token-guard";
export * from "./access-token-principal";
export type { AuthConfig } from "./auth-config";
export { createAuthConfig, getAuthUserId } from "./auth-config";
export type { CreateAuthConfigOptions } from "./auth-config";
export * from "./identity-provisioning-rate-limit-guard";
export * from "./jwt";
export * from "./oidc-access-token";
export * from "./types";
