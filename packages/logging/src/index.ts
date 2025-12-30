/**
 * @packageDocumentation
 * Shared logging types and core helpers for Axiom-first logging.
 *
 * @remarks
 * Runtime helpers accept a custom {@link Transport} when you need to swap
 * providers without changing call sites.
 *
 * @remarks
 * Runtime helpers live in:
 * - `@o3osatoshi/logging/node`
 * - `@o3osatoshi/logging/edge`
 * - `@o3osatoshi/logging/browser`
 *
 * Axiom-specific helpers live in:
 * - `@o3osatoshi/logging/axiom`
 *
 * Next.js helpers live in:
 * - `@o3osatoshi/logging/nextjs`
 * - `@o3osatoshi/logging/nextjs/client`
 *
 * Proxy helpers live in:
 * - `@o3osatoshi/logging/proxy`
 */

export { createAxiomClient, createAxiomTransport } from "./axiom";
export type {
  AxiomClient,
  AxiomClientOptions,
  ClientMode,
} from "./axiom";
export { createLogger } from "./core/logger";
export type { CreateLoggerOptions } from "./core/logger";
export {
  createTraceContext,
  formatTraceparent,
  parseTraceparent,
} from "./core/trace";
export type { TraceContext } from "./core/trace";
export * from "./types";
export type { ClientOptions } from "@axiomhq/js";
