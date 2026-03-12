import { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";
import {
  buildHttpResponse,
  deserializeResponseBody,
  fetchResponse,
  type HttpRequest,
  type HttpResponse,
  newFetchError,
  omitUndefined,
} from "@o3osatoshi/toolkit";

/**
 * Low-level typed fetch function for external APIs.
 *
 * It only performs request transport and response-body decoding; concerns like
 * cache, logging, and retry are intentionally composed by higher layers.
 *
 * @public
 */
export type BaseFetch = (
  request: BaseFetchRequest,
) => ResultAsync<HttpResponse<unknown>, RichError>;

/**
 * Request shape for `BaseFetch`.
 *
 * @public
 */
export type BaseFetchRequest = {
  body?: RequestInit["body"];
  headers?: RequestInit["headers"];
  method?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  url: string;
};

/**
 * Optional transport options.
 *
 * - `fetch`: swap in a test/mocked fetch implementation.
 *
 * @public
 */
export type CreateBaseFetchOptions = {
  fetch?: typeof fetch;
};

/**
 * Create a base fetcher that converts transport responses into `HttpResponse`.
 *
 * Behavior:
 * - builds `RequestInit` from options
 * - enforces request timeout via `resolveAbortSignal`
 * - maps fetch/deserialize failures into `RichError` with `newFetchError`
 *
 * @param options Base fetch configuration.
 * @returns `BaseFetch` function.
 * @public
 */
export function createBaseFetch(
  options: CreateBaseFetchOptions = {},
): BaseFetch {
  return (
    request: BaseFetchRequest,
  ): ResultAsync<HttpResponse<unknown>, RichError> => {
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
): ResultAsync<HttpResponse, RichError> {
  return ResultAsync.fromPromise(deserializeResponseBody(response), (cause) =>
    newFetchError({
      cause,
      details: { action: "DeserializeExternalApiResponseBody" },
      kind: "BadGateway",
      request,
    }),
  ).map((data) => buildHttpResponse(data, response));
}

function performFetch(
  fetcher: typeof fetch,
  request: BaseFetchRequest,
): ResultAsync<Response, RichError> {
  return fetchResponse(
    {
      ...omitUndefined({
        body: request.body,
        headers: request.headers,
        method: request.method,
        signal: request.signal,
        timeoutMs: request.timeoutMs,
      }),
      url: request.url,
    },
    {
      error: {
        action: "FetchExternalApi",
      },
      fetch: fetcher,
    },
  );
}
