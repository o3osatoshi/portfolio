import { createServerFetch } from "./server-fetch";
import type { ServerFetchClient } from "./types";
import type { CacheOptions } from "./with-cache";
import { withCache } from "./with-cache";
import type { EventsOptions } from "./with-events";
import { withEvents } from "./with-events";
import { withMetrics } from "./with-metrics";
import type { RetryOptions } from "./with-retry";
import { withRetry } from "./with-retry";

export type CreateServerFetchClientOptions<T> = {
  cache?: CacheOptions<T> | undefined;
  fetch?: typeof fetch | undefined;
  logging?: LoggingOptions | undefined;
  retry?: RetryOptions | undefined;
};

export type ExchangeRateApiClientOptions<T> = {
  cache?: Partial<CacheOptions<T>>;
} & Omit<CreateServerFetchClientOptions<T>, "cache">;

export type LoggingOptions = {
  enableEvents?: boolean;
  enableMetrics?: boolean;
} & Pick<EventsOptions, "logger" | "redactUrl" | "requestName">;

export function createServerFetchClient<T>(
  options: CreateServerFetchClientOptions<T> = {},
): ServerFetchClient<T> {
  let client = createServerFetch<T>(
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
