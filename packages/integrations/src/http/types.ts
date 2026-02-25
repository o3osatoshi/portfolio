import type { ResultAsync } from "neverthrow";
import type { z } from "zod";

import type { HttpResponse, Layer, RichError } from "@o3osatoshi/toolkit";

import type { BaseFetchRequest } from "./base-fetch";
import type { SmartFetchRequestCacheOptions } from "./with-cache";
import type { SmartFetchRequestLoggingOptions } from "./with-logging";
import type { SmartFetchRequestRetryOptions } from "./with-retry";

/**
 * Typed external fetch function used by API integrations.
 *
 * Generic `S` binds the response decoder schema; success values are typed
 * with `z.infer<S>`.
 *
 * @public
 */
export type SmartFetch = <S extends z.ZodType>(
  request: SmartFetchRequest<S>,
) => ResultAsync<SmartFetchResponse<z.infer<S>>, RichError>;

/**
 * Request passed to `SmartFetch`.
 *
 * - `decode` is mandatory and defines the response schema.
 * - `cache` / `logging` / `retry` can override per-request behavior.
 *
 * @public
 */
export type SmartFetchRequest<S extends z.ZodType = z.ZodType<unknown>> = {
  cache?: SmartFetchRequestCacheOptions<S> | undefined;
  decode: {
    context?: { action: string; layer?: Layer };
    schema: S;
  };
  logging?: SmartFetchRequestLoggingOptions | undefined;
  retry?: SmartFetchRequestRetryOptions<S> | undefined;
} & BaseFetchRequest;

/**
 * Response returned by `SmartFetch`.
 *
 * Includes transport metadata and decoded `data`.
 *
 * @public
 */
export type SmartFetchResponse<T = unknown> = HttpResponse<T>;
