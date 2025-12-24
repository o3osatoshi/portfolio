/**
 * @packageDocumentation
 * Axiom-specific logging helpers.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/axiom` when you need direct access to the
 * Axiom SDK client or transport helpers.
 */

export { createAxiomClient, createAxiomTransport } from "./core/axiom";
export type {
  AxiomClient,
  AxiomClientOptions,
  ClientMode,
} from "./core/axiom";
