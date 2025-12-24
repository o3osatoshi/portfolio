/**
 * @packageDocumentation
 * Shared logging types and core helpers for Axiom-based logging.
 *
 * @remarks
 * Runtime helpers live in:
 * - `@o3osatoshi/logging/node`
 * - `@o3osatoshi/logging/edge`
 * - `@o3osatoshi/logging/browser`
 */

export { createAxiomClient, createAxiomTransport } from "./core/axiom";
export type {
  AxiomClient,
  AxiomClientOptions,
  ClientMode,
} from "./core/axiom";
export { createLogger } from "./core/logger";
export type { CreateLoggerOptions } from "./core/logger";
export {
  createTraceContext,
  formatTraceparent,
  parseTraceparent,
} from "./core/trace";
export type { TraceContext } from "./core/trace";
export * from "./types";
