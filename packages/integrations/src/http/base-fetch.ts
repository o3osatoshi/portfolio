import { ResultAsync } from "neverthrow";
import type { z } from "zod";

import { newFetchError, parseAsyncWith } from "@o3osatoshi/toolkit";

import type {
  SmartFetch,
  SmartFetchRequest,
  SmartFetchResponse,
} from "./smart-fetch-types";

export type CreateBaseFetchOptions = {
  fetch?: typeof fetch;
};

export function createBaseFetch(
  options: CreateBaseFetchOptions = {},
): SmartFetch {
  const fetcher = options.fetch ?? fetch;

  return <S extends z.ZodType>(
    request: SmartFetchRequest<S>,
  ): ResultAsync<SmartFetchResponse<z.infer<S>>, Error> => {
    const method = request.method ?? "GET";
    const requestMeta = { method, url: request.url };

    return performFetch(fetcher, request)
      .andThen((response) => deserializeBody(response, request))
      .andThen((body) => decodeBody(body, request))
      .mapErr((cause) => {
        // Pass through structured errors from newFetchError or newZodError
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

function decodeBody<S extends z.ZodType>(
  body: { data: unknown; response: Response },
  request: SmartFetchRequest<S>,
): ResultAsync<SmartFetchResponse<z.infer<S>>, Error> {
  const decodeContext = request.decode.context ?? {
    action: "ParseExternalApiResponse",
    layer: "External" as const,
  };

  return parseAsyncWith(
    request.decode.schema,
    decodeContext,
  )(body.data).map((data) => ({
    cached: false,
    data,
    meta: {},
    response: {
      headers: body.response.headers,
      ok: body.response.ok,
      status: body.response.status,
      statusText: body.response.statusText,
      url: body.response.url,
    },
  }));
}

function deserializeBody(
  response: Response,
  request: SmartFetchRequest<any>,
): ResultAsync<{ data: unknown; response: Response }, Error> {
  if (!isDeserializableResponse(response)) {
    return ResultAsync.fromSafePromise(
      Promise.resolve({ data: null, response }),
    );
  }

  return ResultAsync.fromPromise(response.json(), (cause) =>
    newFetchError({
      action: "DeserializeResponseBody",
      cause,
      kind: "BadGateway",
      request: { method: request.method ?? "GET", url: request.url },
    }),
  ).map((data) => ({ data, response }));
}

function isDeserializableResponse(response: Response): boolean {
  // No response provided
  if (!response) return false;

  // No content responses
  if (
    response.status === 204 ||
    response.status === 205 ||
    response.status === 304
  ) {
    return false;
  }

  // Empty body by content-length
  const contentLength = response.headers?.get("content-length");
  if (contentLength !== null) {
    const length = Number(contentLength);
    if (!Number.isNaN(length) && length === 0) {
      return false;
    }
  }

  // Check content-type for JSON
  const contentType = response.headers?.get("content-type");
  if (!contentType) return false;

  return contentType.toLowerCase().includes("json");
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
  request: SmartFetchRequest<any>,
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
