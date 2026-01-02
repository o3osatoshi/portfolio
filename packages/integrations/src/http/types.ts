import type { ResultAsync } from "neverthrow";
import type { z } from "zod";

import type { HttpResponse, Layer } from "@o3osatoshi/toolkit";

import type { SmartFetchRequestCacheOptions } from "./with-cache";
import type { SmartFetchRequestLoggingOptions } from "./with-logging";
import type { SmartFetchRequestRetryOptions } from "./with-retry";

export type SmartFetch = <S extends z.ZodType>(
  request: SmartFetchRequest<S>,
) => ResultAsync<SmartFetchResponse<z.infer<S>>, Error>;

export type SmartFetchRequest<S extends z.ZodType = z.ZodType<unknown>> = {
  body?: RequestInit["body"];
  cache?: SmartFetchRequestCacheOptions<S> | undefined;
  decode: {
    context?: { action: string; layer?: Layer };
    schema: S;
  };
  headers?: RequestInit["headers"];
  logging?: SmartFetchRequestLoggingOptions | undefined;
  method?: string;
  retry?: SmartFetchRequestRetryOptions<S> | undefined;
  signal?: AbortSignal;
  timeoutMs?: number;
  url: string;
};

export type SmartFetchResponse<T = unknown> = HttpResponse<T>;
