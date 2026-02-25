/**
 * @packageDocumentation
 * Server-side HTTP client helpers (fetch, retries, caching, logging).
 *
 * Re-export surface:
 * - {@link SmartFetch} and request/response types
 * - composable middleware (`withCache`, `withLogging`, `withRetry`)
 * - concrete smart fetch builder (`createSmartFetch`)
 */
export * from "./smart-fetch";
export * from "./types";
export * from "./with-cache";
export * from "./with-logging";
export * from "./with-retry";
