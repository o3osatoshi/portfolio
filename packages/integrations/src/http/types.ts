import type { ResultAsync } from "neverthrow";

export type FetchMeta = {
  attempts?: number;
  cacheHit?: boolean;
  cacheKey?: string;
};

export type ResponseMeta = {
  headers: Headers;
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
};

export type ServerFetchClient<T> = (
  request: ServerFetchRequest<T>,
) => ResultAsync<ServerFetchResponse<T>, Error>;

export type ServerFetchRequest<T> = {
  body?: RequestInit["body"];
  headers?: RequestInit["headers"];
  method?: string;
  parse?: (res: Response) => Promise<T>;
  signal?: AbortSignal;
  timeoutMs?: number;
  url: string;
};

export type ServerFetchResponse<T> = {
  cached: boolean;
  data: T;
  meta: FetchMeta;
  response?: ResponseMeta | undefined;
};

export function mergeMeta(base: FetchMeta, extra?: FetchMeta): FetchMeta {
  return {
    ...base,
    ...(extra ?? {}),
  };
}
