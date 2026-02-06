import type { ResultAsync } from "neverthrow";
import type { z } from "zod";

import type { HttpResponse, Layer, RichError } from "@o3osatoshi/toolkit";

import type { BaseFetchRequest } from "./base-fetch";
import type { SmartFetchRequestCacheOptions } from "./with-cache";
import type { SmartFetchRequestLoggingOptions } from "./with-logging";
import type { SmartFetchRequestRetryOptions } from "./with-retry";

export type SmartFetch = <S extends z.ZodType>(
  request: SmartFetchRequest<S>,
) => ResultAsync<SmartFetchResponse<z.infer<S>>, RichError>;

export type SmartFetchRequest<S extends z.ZodType = z.ZodType<unknown>> = {
  cache?: SmartFetchRequestCacheOptions<S> | undefined;
  decode: {
    context?: { action: string; layer?: Layer };
    schema: S;
  };
  logging?: SmartFetchRequestLoggingOptions | undefined;
  retry?: SmartFetchRequestRetryOptions<S> | undefined;
} & BaseFetchRequest;

export type SmartFetchResponse<T = unknown> = HttpResponse<T>;
