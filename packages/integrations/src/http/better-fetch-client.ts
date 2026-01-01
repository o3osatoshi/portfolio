import { createBetterFetch } from "./better-fetch";
import type { BetterFetchClient } from "./better-fetch-types";
import type { BetterFetchCacheOptions } from "./with-cache";
import { withCache } from "./with-cache";
import type { BetterFetchEventsOptions } from "./with-events";
import { withEvents } from "./with-events";
import { withMetrics } from "./with-metrics";
import type { BetterFetchRetryOptions } from "./with-retry";
import { withRetry } from "./with-retry";

export type ApiBetterFetchClientOptions<T> = {
  cache?: Partial<BetterFetchCacheOptions<T>>;
} & Omit<CreateBetterFetchClientOptions<T>, "cache">;

export type BetterFetchLoggingOptions = {
  enableEvents?: boolean;
  enableMetrics?: boolean;
} & Pick<BetterFetchEventsOptions, "logger" | "redactUrl" | "requestName">;

export type CreateBetterFetchClientOptions<T> = {
  cache?: BetterFetchCacheOptions<T> | undefined;
  fetch?: typeof fetch | undefined;
  logging?: BetterFetchLoggingOptions | undefined;
  retry?: BetterFetchRetryOptions | undefined;
};

export function createBetterFetchClient<T>(
  options: CreateBetterFetchClientOptions<T> = {},
): BetterFetchClient<T> {
  let client = createBetterFetch<T>(
    options.fetch ? { fetch: options.fetch } : {},
  );

  if (options.retry !== undefined) {
    client = withRetry<T>(client, options.retry ?? {});
  }

  if (options.cache) {
    client = withCache<T>(client, options.cache);
  }

  if (options.logging) {
    const {
      enableEvents = true,
      enableMetrics = true,
      ...rest
    } = options.logging;
    if (enableEvents) {
      client = withEvents<T>(client, rest);
    }
    if (enableMetrics) {
      client = withMetrics<T>(client, rest);
    }
  }

  return client;
}
