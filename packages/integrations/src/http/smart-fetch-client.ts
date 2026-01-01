import { createSmartFetch } from "./smart-fetch";
import type { SmartFetchCache, SmartFetchClient } from "./smart-fetch-types";
import { withCache } from "./with-cache";
import type { SmartFetchEventsOptions } from "./with-events";
import { withEvents } from "./with-events";
import { withMetrics } from "./with-metrics";
import type { SmartFetchRetryOptions } from "./with-retry";
import { withRetry } from "./with-retry";

export type ApiSmartFetchClientOptions = {
  cache?: SmartFetchCache;
} & Omit<CreateSmartFetchClientOptions, "cache">;

export type CreateSmartFetchClientOptions = {
  cache?: SmartFetchCache | undefined;
  fetch?: typeof fetch | undefined;
  logging?: SmartFetchLoggingOptions | undefined;
  retry?: SmartFetchRetryOptions | undefined;
};

export type SmartFetchLoggingOptions = {
  enableEvents?: boolean;
  enableMetrics?: boolean;
} & Pick<SmartFetchEventsOptions, "logger" | "redactUrl" | "requestName">;

export function createSmartFetchClient(
  options: CreateSmartFetchClientOptions = {},
): SmartFetchClient {
  let client = createSmartFetch(options.fetch ? { fetch: options.fetch } : {});

  if (options.retry !== undefined) {
    client = withRetry(client, options.retry ?? {});
  }

  client = withCache(client, options.cache ?? {});

  if (options.logging) {
    const {
      enableEvents = true,
      enableMetrics = true,
      ...rest
    } = options.logging;
    if (enableEvents) {
      client = withEvents(client, rest);
    }
    if (enableMetrics) {
      client = withMetrics(client, rest);
    }
  }

  return client;
}
