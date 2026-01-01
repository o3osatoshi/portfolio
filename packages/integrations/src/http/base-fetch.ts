import { ResultAsync } from "neverthrow";

import {
  buildHttpResponse,
  deserializeResponseBody,
  type HttpRequestMeta,
  type HttpResponse,
  newFetchError,
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
  const fetcher = options.fetch ?? fetch;

  return (
    request: BaseFetchRequest,
  ): ResultAsync<HttpResponse<unknown>, Error> => {
    const method = request.method ?? "GET";
    const requestMeta: HttpRequestMeta = { method, url: request.url };

    return performFetch(fetcher, request)
      .andThen((response) => deserializeBody(response, requestMeta))
      .mapErr((cause) => {
        // Pass through structured errors from newFetchError
        if (cause instanceof Error && isStructuredError(cause)) {
          return cause;
        }

        return newFetchError({
          action: "FetchExternalApi",
          cause,
          request: requestMeta,
        });
      });
  };
}

function deserializeBody(
  response: Response,
  requestMeta: HttpRequestMeta,
): ResultAsync<HttpResponse<unknown>, Error> {
  return ResultAsync.fromPromise(deserializeResponseBody(response), (cause) =>
    newFetchError({
      action: "DeserializeResponseBody",
      cause,
      kind: "BadGateway",
      request: requestMeta,
    }),
  ).map((data) => buildHttpResponse(data, response));
}

function isStructuredError(error: Error): boolean {
  return (
    error.name.includes("BadGateway") ||
    error.name.includes("Validation") ||
    error.name.includes("NotFound") ||
    error.name.includes("Unauthorized") ||
    error.name.includes("Forbidden") ||
    error.name.includes("RateLimit") ||
    error.name.includes("Unavailable") ||
    error.name.includes("Timeout") ||
    error.name.includes("Serialization")
  );
}

function performFetch(
  fetcher: typeof fetch,
  request: BaseFetchRequest,
): ResultAsync<Response, Error> {
  const { cleanup, signal } = resolveSignal(request.signal, request.timeoutMs);

  const init: RequestInit = {
    ...(request.method ? { method: request.method } : {}),
    ...(request.headers ? { headers: request.headers } : {}),
    ...(request.body !== undefined ? { body: request.body } : {}),
    ...(signal ? { signal } : {}),
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

function resolveSignal(signal?: AbortSignal, timeoutMs?: number) {
  if (!timeoutMs) {
    return { cleanup: () => {}, signal };
  }

  const controller = new AbortController();
  const onAbort = () => {
    controller.abort(signal?.reason);
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return { cleanup: () => {}, signal: controller.signal };
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }

  const timeoutId = setTimeout(() => {
    controller.abort(new Error("Request timeout exceeded"));
  }, timeoutMs);

  const cleanup = () => {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", onAbort);
    }
  };

  return { cleanup, signal: controller.signal };
}
