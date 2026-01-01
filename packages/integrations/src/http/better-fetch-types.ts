import type { ResultAsync } from "neverthrow";

export type BetterFetchClient<T> = (
  request: BetterFetchRequest<T>,
) => ResultAsync<BetterFetchResponse<T>, Error>;

export type BetterFetchMeta = {
  attempts?: number;
  cacheHit?: boolean;
  cacheKey?: string;
};

export type BetterFetchRequest<T> = {
  body?: RequestInit["body"];
  headers?: RequestInit["headers"];
  method?: string;
  parse?: (res: Response) => Promise<T>;
  signal?: AbortSignal;
  timeoutMs?: number;
  url: string;
};

export type BetterFetchResponse<T> = {
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
