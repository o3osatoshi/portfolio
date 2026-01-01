import type { CacheStore } from "@repo/domain";
import type { ResultAsync } from "neverthrow";
import type { z } from "zod";

import type { Layer } from "@o3osatoshi/toolkit";

export type SmartFetch = <S extends z.ZodType>(
  request: SmartFetchRequest<S>,
) => ResultAsync<SmartFetchResponse<z.infer<S>>, Error>;

export type SmartFetchCacheOptions<T = unknown> = {
  deserialize?: (data: unknown) => null | T;
  getKey?: (request: SmartFetchRequestMeta) => string | undefined;
  serialize?: (data: T) => unknown;
  shouldCache?: (response: SmartFetchResponse<T>) => boolean;
  store?: CacheStore | undefined;
  ttlMs?: number;
};

export type SmartFetchMeta = {
  attempts?: number;
  cacheHit?: boolean;
  cacheKey?: string;
};

export type SmartFetchRequest<S extends z.ZodType> = {
  cache?: SmartFetchCacheOptions<z.infer<S>> | undefined;
  decode: {
    context?: { action: string; layer?: Layer };
    schema: S;
  };
} & SmartFetchRequestMeta;

export type SmartFetchRequestMeta = {
  body?: RequestInit["body"];
  headers?: RequestInit["headers"];
  method?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  url: string;
};

export type SmartFetchResponse<T = unknown> = {
  cached: boolean;
  data: T;
  meta: SmartFetchMeta;
  response?: SmartFetchResponseMeta | undefined;
};

export type SmartFetchResponseMeta = {
  headers: Headers;
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
};

export function mergeMeta(
  base: SmartFetchMeta,
  extra?: SmartFetchMeta,
): SmartFetchMeta {
  return {
    ...base,
    ...(extra ?? {}),
  };
}
