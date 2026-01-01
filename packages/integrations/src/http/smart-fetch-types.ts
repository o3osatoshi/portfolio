import type { CacheStore } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export type SmartFetchCache = {
  getKey?: (request: SmartFetchRequestMeta) => string | undefined;
  store?: CacheStore | undefined;
  ttlMs?: number;
};

export type SmartFetchCacheOptions<T = unknown> = {
  deserialize?: (data: unknown) => null | T;
  serialize?: (data: T) => unknown;
  shouldCache?: (response: SmartFetchResponse<T>) => boolean;
} & SmartFetchCache;

export type SmartFetchClient = <T = unknown>(
  request: SmartFetchRequest<T>,
) => ResultAsync<SmartFetchResponse<T>, Error>;

export type SmartFetchMeta = {
  attempts?: number;
  cacheHit?: boolean;
  cacheKey?: string;
};

export type SmartFetchRequest<T = unknown> = {
  cache?: SmartFetchCacheOptions<T> | undefined;
  parse?: (res: Response) => Promise<T>;
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
