import type { ResultAsync } from "neverthrow";
import type { z } from "zod";

import type { RichError } from "@o3osatoshi/toolkit";
import { parseWith } from "@o3osatoshi/toolkit";

import { createBaseFetch } from "./base-fetch";
import type {
  SmartFetch,
  SmartFetchRequest,
  SmartFetchResponse,
} from "./types";
import { type SmartFetchCacheOptions, withCache } from "./with-cache";
import type { SmartFetchLoggingOptions } from "./with-logging";
import { withLogging } from "./with-logging";
import type { SmartFetchRetryOptions } from "./with-retry";
import { withRetry } from "./with-retry";

/**
 * Default configuration used by `createSmartFetch`.
 *
 * Options can be set globally and overridden per request.
 *
 * @public
 */
export type CreateSmartFetchOptions = {
  cache?: SmartFetchCacheOptions | undefined;
  fetch?: typeof fetch | undefined;
  logging?: SmartFetchLoggingOptions | undefined;
  retry?: SmartFetchRetryOptions | true | undefined;
};

/**
 * Create a composable typed fetch helper for external APIs.
 *
 * Composition order:
 * 1. retry wrapper (if enabled)
 * 2. cache wrapper (if enabled)
 * 3. logging wrapper (if enabled)
 *
 * Default retry/cache/logging behavior is delegated to each wrapper's default
 * options when no option is provided.
 *
 * @param options Base options and optional wrapper policies.
 * @returns A typed `SmartFetch` pipeline.
 * @public
 */
export function createSmartFetch(
  options: CreateSmartFetchOptions = {},
): SmartFetch {
  const smartFetch: SmartFetch = <S extends z.ZodType>(
    request: SmartFetchRequest<S>,
  ): ResultAsync<SmartFetchResponse<z.infer<S>>, RichError> => {
    const { decode, ...baseRequest } = request;

    const baseFetch = createBaseFetch(
      options.fetch ? { fetch: options.fetch } : {},
    );

    return baseFetch(baseRequest).andThen((response) => {
      return parseWith(decode.schema, {
        action: decode.context?.action ?? "DecodeResponseBody",
        layer: decode.context?.layer ?? "External",
      })(response.data).map((data) => ({ ...response, data }));
    });
  };

  let fetch = smartFetch;

  if (options.retry !== undefined) {
    fetch = withRetry(fetch, options.retry === true ? {} : options.retry);
  }

  if (options.cache !== undefined) {
    fetch = withCache(fetch, options.cache);
  }

  if (options.logging !== undefined) {
    fetch = withLogging(fetch, options.logging);
  }

  return fetch;
}
