import { Axiom, AxiomWithoutBatching, type ClientOptions } from "@axiomhq/js";

import type { AxiomConfig, LogEvent, Transport } from "../types";

/**
 * Axiom client type used for ingestion.
 *
 * @public
 */
export type AxiomClient = Axiom | AxiomWithoutBatching;

/**
 * Configuration for constructing an Axiom client.
 *
 * @public
 */
export interface AxiomClientConfig extends AxiomConfig {
  /**
   * Client ingestion mode.
   *
   * @defaultValue "batch"
   */
  mode?: AxiomClientMode;
  /**
   * Optional ingestion error handler.
   *
   * @remarks
   * When omitted, {@link createAxiomTransport} falls back to `console.error`.
   */
  onError?: (error: Error) => void;
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
export type AxiomClientMode = "batch" | "immediate";

/**
 * Create an Axiom client with the provided configuration.
 *
 * @remarks
 * Uses batch ingestion by default. Use `mode: "immediate"` for Edge/Browser.
 *
 * @public
 */
export function createAxiomClient(config: AxiomClientConfig): AxiomClient {
  const options: ClientOptions = {
    token: config.token,
    ...(config.orgId ? { orgId: config.orgId } : {}),
    ...(config.url ? { url: config.url } : {}),
    ...(config.onError ? { onError: config.onError } : {}),
  };

  if (config.mode === "immediate") {
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
export function createAxiomTransport(config: AxiomClientConfig): Transport {
  const onError = config.onError ?? ((error: Error) => console.error(error));
  const client = createAxiomClient({ ...config, onError });

  const emit = (dataset: string, events: LogEvent | LogEvent[]) => {
    const payload = Array.isArray(events) ? events : [events];
    try {
      const result = client.ingest(dataset, payload);
      if (result && typeof (result as Promise<unknown>).catch === "function") {
        void (result as Promise<unknown>).catch((error) => {
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
