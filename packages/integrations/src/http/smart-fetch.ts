import type { z } from "zod";

import { parseAsyncWith } from "@o3osatoshi/toolkit";

import { createBaseFetch } from "./base-fetch";
import type {
  SmartFetch,
  SmartFetchCacheOptions,
  SmartFetchRequest,
} from "./smart-fetch-types";
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
  // Create base fetch function with Zod parsing adapter
  const smartFetch: SmartFetch = <S extends z.ZodType>(
    request: SmartFetchRequest<S>,
  ) => {
    const { decode, ...baseRequest } = request;

    const baseFetch = createBaseFetch(
      options.fetch ? { fetch: options.fetch } : {},
    );

    return baseFetch(baseRequest).andThen((response) => {
      const decodeContext = decode.context ?? {
        action: "ParseExternalApiResponse",
        layer: "External" as const,
      };

      return parseAsyncWith(
        decode.schema,
        decodeContext,
      )(response.data).map((data) => ({ ...response, data }));
    });
  };

  // Apply middleware layers
  let fetch = smartFetch;

  if (options.retry !== undefined) {
    fetch = withRetry(fetch, options.retry);
  }

  if (options.cache !== undefined) {
    fetch = withCache(fetch, options.cache);
  }

  if (options.logging !== undefined) {
    fetch = withLogging(fetch, options.logging);
  }

  return fetch;
}
