import { createServerFetch } from "./server-fetch";
import type { ServerFetchClient } from "./types";
import type { CacheOptions } from "./with-cache";
import { withCache } from "./with-cache";
import type { LoggingOptions } from "./with-logging";
import { withLogging } from "./with-logging";
import { withMetrics } from "./with-metrics";
import type { RetryOptions } from "./with-retry";
import { withRetry } from "./with-retry";

export type CreateServerFetchClientOptions<T> = {
  cache?: CacheOptions<T>;
  fetch?: typeof fetch | undefined;
  observability?: ObservabilityOptions;
  retry?: RetryOptions | undefined;
};

export type ObservabilityOptions = {
  enableLogging?: boolean;
  enableMetrics?: boolean;
} & Pick<LoggingOptions, "logger" | "redactUrl" | "requestName">;

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

  if (options.observability) {
    const {
      enableLogging = true,
      enableMetrics = true,
      ...rest
    } = options.observability;
    if (enableLogging) {
      client = withLogging<T>(client, rest);
    }
    if (enableMetrics) {
      client = withMetrics<T>(client, rest);
    }
  }

  return client;
}
