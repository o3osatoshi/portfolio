/**
 * @packageDocumentation
 * Proxy transport and handler helpers for forwarding logs via your server.
 *
 * @remarks
 * Import from `@o3osatoshi/logging/proxy` to send client logs to a server
 * endpoint before ingesting them into Axiom.
 */

import type { LogEvent, Transport } from "./types";

/**
 * A proxy event envelope pairing a dataset with a log event.
 *
 * @public
 */
export interface ProxyEvent {
  /**
   * Dataset name used when emitting the event.
   */
  dataset: string;
  /**
   * Log or metric event payload.
   */
  event: LogEvent;
}

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
   * Maximum number of events per request.
   *
   * @defaultValue 500
   */
  maxEvents?: number;
  /**
   * Error handler invoked when request processing fails.
   */
  onError?: (error: Error) => void;
  /**
   * Transport used to emit the received events.
   */
  transport: Transport;
}

/**
 * Payload shape accepted by the proxy handler.
 *
 * @public
 */
export interface ProxyPayload {
  /**
   * Events to forward to the server-side transport.
   */
  events: ProxyEvent[];
}

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
   * Maximum events to send per request.
   *
   * @defaultValue 50
   */
  maxBatchSize?: number;
  /**
   * Maximum events buffered in memory before dropping.
   *
   * @defaultValue 1000
   */
  maxBufferSize?: number;
  /**
   * Error handler invoked on send failures or drops.
   */
  onError?: (error: Error) => void;
  /**
   * Base backoff delay in milliseconds.
   *
   * @defaultValue 500
   */
  retryBackoffMs?: number;
  /**
   * Number of retries before dropping buffered events.
   *
   * @defaultValue 2
   */
  retryLimit?: number;
  /**
   * Maximum backoff delay in milliseconds.
   *
   * @defaultValue 5000
   */
  retryMaxBackoffMs?: number;
  /**
   * Proxy endpoint URL.
   */
  url: string;
}

/**
 * Create a proxy handler that forwards client events to the transport.
 *
 * @remarks
 * Accepts {@link ProxyPayload} JSON via POST requests.
 * Returns JSON responses with status information.
 *
 * @public
 */
export function createProxyHandler(options: ProxyHandlerOptions) {
  const allowDatasets = options.allowDatasets
    ? new Set(options.allowDatasets)
    : undefined;
  const maxEvents = Math.max(1, options.maxEvents ?? 500);
  const onError = options.onError ?? ((error: Error) => console.error(error));

  return async (req: Request): Promise<Response> => {
    if (req.method.toUpperCase() !== "POST") {
      return json({ message: "method_not_allowed", status: "error" }, 405);
    }

    let payload: ProxyPayload;
    try {
      payload = (await req.json()) as ProxyPayload;
    } catch (error) {
      onError(toError(error));
      return json({ message: "invalid_json", status: "error" }, 400);
    }

    if (!payload?.events || !Array.isArray(payload.events)) {
      return json({ message: "invalid_payload", status: "error" }, 400);
    }

    if (payload.events.length > maxEvents) {
      return json({ message: "too_many_events", status: "error" }, 413);
    }

    const grouped = new Map<string, LogEvent[]>();

    for (const item of payload.events) {
      if (!item || typeof item !== "object") {
        return json({ message: "invalid_event", status: "error" }, 400);
      }

      const dataset = (item as ProxyEvent).dataset;
      if (!dataset || typeof dataset !== "string") {
        return json({ message: "invalid_dataset", status: "error" }, 400);
      }

      if (allowDatasets && !allowDatasets.has(dataset)) {
        return json({ message: "dataset_not_allowed", status: "error" }, 403);
      }

      const event = (item as ProxyEvent).event;
      if (!event || typeof event !== "object") {
        return json({ message: "invalid_event", status: "error" }, 400);
      }

      const events = grouped.get(dataset) ?? [];
      events.push(event);
      grouped.set(dataset, events);
    }

    try {
      for (const [dataset, events] of grouped.entries()) {
        options.transport.emit(dataset, events);
      }
      await options.transport.flush?.();
      return json({ accepted: payload.events.length, status: "ok" }, 200);
    } catch (error) {
      onError(toError(error));
      return json({ message: "proxy_failed", status: "error" }, 500);
    }
  };
}

/**
 * Create a transport that forwards events to a proxy endpoint.
 *
 * @remarks
 * Uses in-memory buffering with optional auto-flush. Failed sends are retried
 * up to `retryLimit` times before the buffer is dropped.
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
  const retryLimit = Math.max(0, options.retryLimit ?? 2);
  const retryBackoffMs = Math.max(0, options.retryBackoffMs ?? 500);
  const retryMaxBackoffMs = Math.max(
    retryBackoffMs,
    options.retryMaxBackoffMs ?? 5000,
  );
  const onError = options.onError ?? ((error: Error) => console.error(error));
  const headers = {
    "content-type": "application/json",
    ...(options.headers ?? {}),
  };

  let buffer: ProxyEvent[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let inflight: Promise<void> | undefined;
  let retryCount = 0;

  const scheduleFlush = (delayMs: number) => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      flushTimer = undefined;
      void flush();
    }, delayMs);
  };

  const enqueue = (dataset: string, events: LogEvent | LogEvent[]) => {
    const items = Array.isArray(events) ? events : [events];
    for (const event of items) {
      buffer.push({ dataset, event });
    }

    if (buffer.length > maxBufferSize) {
      buffer = buffer.slice(-maxBufferSize);
      onError(new Error("proxy transport buffer overflow"));
    }

    if (buffer.length >= maxBatchSize) {
      void flush();
      return;
    }

    if (options.flushIntervalMs && !flushTimer) {
      scheduleFlush(options.flushIntervalMs);
    }
  };

  const sendBatch = async (batch: ProxyEvent[]) => {
    const init: RequestInit = {
      body: JSON.stringify({ events: batch } satisfies ProxyPayload),
      headers,
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
    if (buffer.length === 0) return;

    const batch = buffer.splice(0, maxBatchSize);

    inflight = (async () => {
      try {
        await sendBatch(batch);
        retryCount = 0;
        if (buffer.length > 0) {
          scheduleFlush(0);
        }
      } catch (error) {
        buffer = batch.concat(buffer);
        retryCount += 1;
        const err = toError(error);

        if (retryCount > retryLimit) {
          buffer = [];
          retryCount = 0;
          onError(
            new Error("proxy transport dropped buffered events after retries"),
          );
        } else {
          onError(err);
          const delay = Math.min(
            retryBackoffMs * 2 ** (retryCount - 1),
            retryMaxBackoffMs,
          );
          scheduleFlush(delay);
        }
      } finally {
        inflight = undefined;
      }
    })();

    return inflight;
  };

  return {
    emit: enqueue,
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

// TODO: Extract common logic
function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(String(error));
}
