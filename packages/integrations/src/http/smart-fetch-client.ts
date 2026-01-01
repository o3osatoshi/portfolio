import { createSmartFetch } from "./smart-fetch";
import type { SmartFetchCache, SmartFetchClient } from "./smart-fetch-types";
import { withCache } from "./with-cache";
import type { SmartFetchLoggingOptions } from "./with-logging";
import { withLogging } from "./with-logging";
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

export function createSmartFetchClient(
  options: CreateSmartFetchClientOptions = {},
): SmartFetchClient {
  let client = createSmartFetch(options.fetch ? { fetch: options.fetch } : {});

  if (options.retry !== undefined) {
    client = withRetry(client, options.retry ?? {});
  }

  client = withCache(client, options.cache ?? {});

  if (options.logging) {
    client = withLogging(client, options.logging);
  }

  return client;
}
