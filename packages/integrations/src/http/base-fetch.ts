import { ResultAsync } from "neverthrow";

import {
  buildHttpResponse,
  deserializeResponseBody,
  type HttpRequest,
  type HttpResponse,
  newFetchError,
  resolveAbortSignal,
} from "@o3osatoshi/toolkit";

export type BaseFetch = (
  request: BaseFetchRequest,
) => ResultAsync<HttpResponse<unknown>, Error>;

export type BaseFetchRequest = {
  body?: RequestInit["body"];
  headers?: RequestInit["headers"];
  method?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  url: string;
};

export type CreateBaseFetchOptions = {
  fetch?: typeof fetch;
};

export function createBaseFetch(
  options: CreateBaseFetchOptions = {},
): BaseFetch {
  return (
    request: BaseFetchRequest,
  ): ResultAsync<HttpResponse<unknown>, Error> => {
    const req: HttpRequest = {
      method: request.method ?? "GET",
      url: request.url,
    };

    return performFetch(options.fetch ?? fetch, request).andThen((res) =>
      deserializeBody(res, req),
    );
  };
}

function deserializeBody(
  response: Response,
  request: HttpRequest,
): ResultAsync<HttpResponse, Error> {
  return ResultAsync.fromPromise(deserializeResponseBody(response), (cause) =>
    newFetchError({
      action: "DeserializeResponseBody",
      cause,
      kind: "BadGateway",
      request,
    }),
  ).map((data) => buildHttpResponse(data, response));
}

function performFetch(
  fetcher: typeof fetch,
  request: BaseFetchRequest,
): ResultAsync<Response, Error> {
  const { cleanup, signal } = resolveAbortSignal({
    signal: request.signal,
    timeoutMs: request.timeoutMs,
  });

  const init: RequestInit = {
    ...(request.method !== undefined ? { method: request.method } : {}),
    ...(request.headers !== undefined ? { headers: request.headers } : {}),
    ...(request.body !== undefined ? { body: request.body } : {}),
    ...(signal !== undefined ? { signal } : {}),
  };

  return ResultAsync.fromPromise(fetcher(request.url, init), (cause) =>
    newFetchError({
      action: "FetchExternalApi",
      cause,
      request: { method: request.method ?? "GET", url: request.url },
    }),
  ).map((response) => {
    cleanup();
    return response;
  });
}
