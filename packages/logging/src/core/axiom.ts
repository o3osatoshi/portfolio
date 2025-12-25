import { Axiom, AxiomWithoutBatching, type ClientOptions } from "@axiomhq/js";

import type { LogEvent, Transport } from "../types";

/**
 * Axiom client type used for ingestion.
 *
 * @public
 */
export type AxiomClient = Axiom | AxiomWithoutBatching;

/**
 * Configuration for constructing an Axiom client.
 *
 * @remarks
 * Extends `ClientOptions` from `@axiomhq/js`; `token` is required.
 *
 * @public
 */
export interface AxiomClientOptions extends ClientOptions {
  /**
   * Client ingestion mode.
   *
   * @defaultValue "batch"
   */
  mode?: ClientMode;
}

/**
 * Axiom client mode for ingestion.
 *
 * @remarks
 * - `batch` uses background buffering (recommended for Node).
 * - `immediate` sends each payload immediately (recommended for Edge/Browser).
 *
 * @public
 */
export type ClientMode = "batch" | "immediate";

/**
 * Create an Axiom client with the provided configuration.
 *
 * @remarks
 * Uses batch ingestion by default. Use `mode: "immediate"` for Edge/Browser.
 *
 * @public
 */
export function createAxiomClient(options: AxiomClientOptions): AxiomClient {
  if (options.mode === "immediate") {
    return new AxiomWithoutBatching(options);
  }
  return new Axiom(options);
}

/**
 * Create a {@link Transport} backed by the Axiom client.
 *
 * @remarks
 * Falls back to `console.error` when no `onError` handler is provided.
 *
 * @public
 */
export function createAxiomTransport(options: AxiomClientOptions): Transport {
  const onError = options.onError ?? ((error: Error) => console.error(error));
  const client = createAxiomClient({ ...options, onError });

  const emit = (dataset: string, events: LogEvent | LogEvent[]) => {
    const payload = Array.isArray(events) ? events : [events];
    try {
      const result = client.ingest(dataset, payload);
      if (result && typeof result.catch === "function") {
        void result.catch((error) => {
          if (error instanceof Error) {
            onError(error);
          } else {
            onError(new Error("Axiom ingest failed"));
          }
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        onError(error);
      } else {
        onError(new Error("Axiom ingest failed"));
      }
    }
  };

  const flush = async () => {
    if ("flush" in client) {
      await client.flush();
    }
  };

  return {
    emit,
    flush,
    shutdown: flush,
  };
}
