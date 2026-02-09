/**
 * @packageDocumentation
 * Proxy transport and handler helpers for forwarding logs via your server.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/proxy` to send client logs to a server
 * endpoint before ingesting them into Axiom.
 */

import { z } from "zod";

import { toRichError } from "@o3osatoshi/toolkit";

import { type LogEvent, logEventSchema, type Transport } from "./types";

/**
 * Zod schema for {@link EventSet}.
 *
 * @remarks
 * Each event set pairs a dataset name with a single log event.
 *
 * @public
 */
export const eventSetSchema = z.object({
  dataset: z.string(),
  event: logEventSchema,
});

/**
 * Dataset + event envelope emitted by the proxy transport.
 *
 * @public
 */
export type EventSet = z.infer<typeof eventSetSchema>;

/**
 * Configuration for the proxy handler.
 *
 * @public
 */
export interface ProxyHandlerOptions {
  /**
   * Allowed dataset names. When omitted, all datasets are accepted.
   */
  allowDatasets?: ReadonlyArray<string>;
  /**
   * Maximum number of event sets per request.
   *
   * @defaultValue 500
   */
  maxEvents?: number;
  /**
   * Error handler invoked when request processing fails.
   */
  onError?: (error: unknown) => void;
  /**
   * Transport used to emit the received events.
   */
  transport: Transport;
}

/**
 * Zod schema for {@link ProxyPayload}.
 *
 * @public
 */
export const proxyPayloadSchema = z.object({
  eventSets: z.array(eventSetSchema),
});

/**
 * Request payload accepted by {@link createProxyHandler}.
 *
 * @public
 */
export type ProxyPayload = z.infer<typeof proxyPayloadSchema>;

/**
 * Configuration for the proxy transport.
 *
 * @public
 */
export interface ProxyTransportOptions {
  /**
   * Optional credentials mode for proxy requests.
   */
  credentials?: "include" | "omit" | "same-origin";
  /**
   * Custom fetch implementation (defaults to `globalThis.fetch`).
   */
  fetch?: typeof fetch;
  /**
   * Auto-flush interval in milliseconds. When omitted, flush is manual.
   */
  flushIntervalMs?: number;
  /**
   * Optional headers added to proxy requests.
   */
  headers?: Record<string, string>;
  /**
   * Maximum event sets to send per request.
   *
   * @defaultValue 50
   */
  maxBatchSize?: number;
  /**
   * Maximum event sets buffered in memory before dropping.
   *
   * @defaultValue 1000
   */
  maxBufferSize?: number;
  /**
   * Error handler invoked on send failures or drops.
   */
  onError?: (error: unknown) => void;
  /**
   * Proxy endpoint URL.
   */
  url: string;
}

/**
 * Create a proxy handler that forwards client event sets to the transport.
 *
 * @remarks
 * Accepts {@link ProxyPayload} JSON (with `eventSets`) via POST requests.
 * Returns JSON responses with status information.
 *
 * @public
 */
export function createProxyHandler(options: ProxyHandlerOptions) {
  const allowDatasets = options.allowDatasets
    ? new Set(options.allowDatasets)
    : undefined;
  const maxEvents = Math.max(1, options.maxEvents ?? 500);
  const onError = options.onError ?? ((error: unknown) => console.error(error));

  return async (req: Request): Promise<Response> => {
    if (req.method.toUpperCase() !== "POST") {
      return json({ message: "method_not_allowed", status: "error" }, 405);
    }

    let rawPayload: unknown;
    try {
      rawPayload = await req.json();
    } catch (error: unknown) {
      onError(
        toRichError(error, {
          details: {
            action: "LoggingProxyParseRequest",
            reason:
              "proxy payload parsing failed with an unexpected error value",
          },
          kind: "Internal",
          layer: "Infrastructure",
        }),
      );
      return json({ message: "invalid_json", status: "error" }, 400);
    }

    const result = proxyPayloadSchema.safeParse(rawPayload);
    if (!result.success) {
      onError(result.error);
      return json({ message: "invalid_proxy_payload", status: "error" }, 400);
    }
    const payload = result.data;

    if (payload.eventSets.length > maxEvents) {
      return json({ message: "too_many_events", status: "error" }, 413);
    }

    const logEventMap = new Map<string, LogEvent[]>();

    for (const eventSet of payload.eventSets) {
      const dataset = eventSet.dataset;

      if (allowDatasets && !allowDatasets.has(dataset)) {
        return json({ message: "dataset_not_allowed", status: "error" }, 403);
      }

      const events = logEventMap.get(dataset) ?? [];
      events.push(eventSet.event);
      logEventMap.set(dataset, events);
    }

    try {
      for (const [dataset, events] of logEventMap.entries()) {
        options.transport.emit(dataset, events);
      }
      await options.transport.flush?.();
      return json({ accepted: payload.eventSets.length, status: "ok" }, 200);
    } catch (error) {
      onError(
        toRichError(error, {
          details: {
            action: "LoggingProxyEmit",
            reason: "proxy emission failed with an unexpected error value",
          },
          kind: "Internal",
          layer: "Infrastructure",
        }),
      );
      return json({ message: "proxy_failed", status: "error" }, 500);
    }
  };
}

/**
 * Create a transport that forwards event sets to a proxy endpoint.
 *
 * @remarks
 * Uses in-memory buffering with optional auto-flush. Failed sends are reported
 * via `onError` and left in the buffer until a later flush succeeds.
 *
 * @throws
 * Throws when `fetch` is unavailable and no custom implementation is provided.
 *
 * @public
 */
export function createProxyTransport(
  options: ProxyTransportOptions,
): Transport {
  const fetcher = options.fetch ?? globalThis.fetch;
  if (!fetcher) {
    throw new Error("fetch is required to use the proxy transport");
  }

  const maxBatchSize = Math.max(1, options.maxBatchSize ?? 50);
  const maxBufferSize = Math.max(maxBatchSize, options.maxBufferSize ?? 1000);
  const onError = options.onError ?? ((error: unknown) => console.error(error));

  let eventSets: EventSet[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let inflight: Promise<void> | undefined;

  const scheduleFlush = (delayMs: number) => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      flushTimer = undefined;
      void flush();
    }, delayMs);
  };

  const emit = (dataset: string, events: LogEvent | LogEvent[]) => {
    const _events = Array.isArray(events) ? events : [events];
    for (const event of _events) {
      eventSets.push({ dataset, event });
    }

    if (eventSets.length > maxBufferSize) {
      eventSets = eventSets.slice(-maxBufferSize);
      onError(new Error("proxy transport buffer overflow"));
    }

    if (eventSets.length >= maxBatchSize) {
      void flush();
      return;
    }

    if (options.flushIntervalMs && !flushTimer) {
      scheduleFlush(options.flushIntervalMs);
    }
  };

  const sendBatch = async (eventSets: EventSet[]) => {
    const init: RequestInit = {
      body: JSON.stringify({ eventSets } satisfies ProxyPayload),
      headers: {
        "content-type": "application/json",
        ...(options.headers ?? {}),
      },
      method: "POST",
    };

    if (options.credentials) {
      init.credentials = options.credentials;
    }

    const response = await fetcher(options.url, init);

    if (!response.ok) {
      throw new Error(`proxy transport failed with ${response.status}`);
    }
  };

  const flush = async () => {
    if (inflight) return inflight;
    if (eventSets.length === 0) return;

    const _eventSets = eventSets.splice(0, maxBatchSize);

    inflight = (async () => {
      try {
        await sendBatch(_eventSets);
        if (eventSets.length > 0) {
          scheduleFlush(0);
        }
      } catch (error: unknown) {
        eventSets = _eventSets.concat(eventSets);
        onError(
          toRichError(error, {
            details: {
              action: "LoggingProxyTransportFlush",
              reason:
                "proxy transport flush failed with an unexpected error value",
            },
            kind: "Internal",
            layer: "Infrastructure",
          }),
        );
      } finally {
        inflight = undefined;
      }
    })();

    return inflight;
  };

  return {
    emit,
    flush,
  };
}

function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
    },
    status,
  });
}
