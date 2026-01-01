import type { CacheStore } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export type BetterFetchCache = {
  getKey?: (request: BetterFetchRequestMeta) => string | undefined;
  store?: CacheStore | undefined;
  ttlMs?: number;
};

export type BetterFetchCacheOptions<T = unknown> = {
  deserialize?: (data: unknown) => null | T;
  serialize?: (data: T) => unknown;
  shouldCache?: (response: BetterFetchResponse<T>) => boolean;
} & BetterFetchCache;

export type BetterFetchClient = <T = unknown>(
  request: BetterFetchRequest<T>,
) => ResultAsync<BetterFetchResponse<T>, Error>;

export type BetterFetchMeta = {
  attempts?: number;
  cacheHit?: boolean;
  cacheKey?: string;
};

export type BetterFetchRequest<T = unknown> = {
  cache?: BetterFetchCacheOptions<T> | undefined;
  parse?: (res: Response) => Promise<T>;
} & BetterFetchRequestMeta;

export type BetterFetchRequestMeta = {
  body?: RequestInit["body"];
  headers?: RequestInit["headers"];
  method?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  url: string;
};

export type BetterFetchResponse<T = unknown> = {
  cached: boolean;
  data: T;
  meta: BetterFetchMeta;
  response?: BetterFetchResponseMeta | undefined;
};

export type BetterFetchResponseMeta = {
  headers: Headers;
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
};

export function mergeMeta(
  base: BetterFetchMeta,
  extra?: BetterFetchMeta,
): BetterFetchMeta {
  return {
    ...base,
    ...(extra ?? {}),
  };
}
