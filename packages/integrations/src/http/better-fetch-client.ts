import { createBetterFetch } from "./better-fetch";
import type {
  BetterFetchCacheDefaults,
  BetterFetchClient,
} from "./better-fetch-types";
import { withCache } from "./with-cache";
import type { BetterFetchEventsOptions } from "./with-events";
import { withEvents } from "./with-events";
import { withMetrics } from "./with-metrics";
import type { BetterFetchRetryOptions } from "./with-retry";
import { withRetry } from "./with-retry";

export type ApiBetterFetchClientOptions = {
  cache?: BetterFetchCacheDefaults;
} & Omit<CreateBetterFetchClientOptions, "cache">;

export type BetterFetchLoggingOptions = {
  enableEvents?: boolean;
  enableMetrics?: boolean;
} & Pick<BetterFetchEventsOptions, "logger" | "redactUrl" | "requestName">;

export type CreateBetterFetchClientOptions = {
  cache?: BetterFetchCacheDefaults | undefined;
  fetch?: typeof fetch | undefined;
  logging?: BetterFetchLoggingOptions | undefined;
  retry?: BetterFetchRetryOptions | undefined;
};

export function createBetterFetchClient(
  options: CreateBetterFetchClientOptions = {},
): BetterFetchClient {
  let client = createBetterFetch(options.fetch ? { fetch: options.fetch } : {});

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
