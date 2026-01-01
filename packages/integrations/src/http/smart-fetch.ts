import { createBaseFetch } from "./base-fetch";
import type { SmartFetch, SmartFetchCacheOptions } from "./smart-fetch-types";
import { withCache } from "./with-cache";
import type { SmartFetchLoggingOptions } from "./with-logging";
import { withLogging } from "./with-logging";
import type { SmartFetchRetryOptions } from "./with-retry";
import { withRetry } from "./with-retry";

export type ApiSmartFetchClientOptions = {
  cache?: SmartFetchCacheOptions;
} & Omit<CreateSmartFetchOptions, "cache">;

export type CreateSmartFetchOptions = {
  cache?: SmartFetchCacheOptions | undefined;
  fetch?: typeof fetch | undefined;
  logging?: SmartFetchLoggingOptions | undefined;
  retry?: SmartFetchRetryOptions | undefined;
};

export function createSmartFetch(
  options: CreateSmartFetchOptions = {},
): SmartFetch {
  let baseFetch = createBaseFetch(
    options.fetch ? { fetch: options.fetch } : {},
  );

  if (options.retry !== undefined) {
    baseFetch = withRetry(baseFetch, options.retry);
  }

  if (options.cache !== undefined) {
    baseFetch = withCache(baseFetch, options.cache);
  }

  if (options.logging !== undefined) {
    baseFetch = withLogging(baseFetch, options.logging);
  }

  return baseFetch;
}
