import { ResultAsync } from "neverthrow";

import { newFetchError } from "@o3osatoshi/toolkit";

import type {
  ServerFetchClient,
  ServerFetchRequest,
  ServerFetchResponse,
} from "./types";

export type CreateServerFetchOptions = {
  fetch?: typeof fetch;
};

class ParseError extends Error {
  constructor(override readonly cause: unknown) {
    super("Failed to parse response body");
  }
}

export function createServerFetch<T = unknown>(
  options: CreateServerFetchOptions = {},
): ServerFetchClient<T> {
  const fetcher = options.fetch ?? fetch;

  return (
    request: ServerFetchRequest<T>,
  ): ResultAsync<ServerFetchResponse<T>, Error> => {
    const method = (request.method ?? "GET").toUpperCase();
    const requestMeta = { method, url: request.url };
    const parse = request.parse ?? defaultParse<T>;

    return ResultAsync.fromPromise(
      performFetch(fetcher, request, parse),
      (cause) => {
        if (cause instanceof ParseError) {
          return newFetchError({
            action: "ParseExternalApiResponse",
            cause: cause.cause,
            kind: "BadGateway",
            request: requestMeta,
          });
        }

        return newFetchError({
          action: "FetchExternalApi",
          cause,
          request: requestMeta,
        });
      },
    );
  };
}

async function defaultParse<T>(res: Response): Promise<T> {
  if (!isDeserializableBody(res)) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.toLowerCase().includes("json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as T;
}

function isDeserializableBody(res: Response) {
  if (res.status === 204 || res.status === 205 || res.status === 304) {
    return false;
  }

  const contentLength = res.headers.get("content-length");
  if (contentLength !== null) {
    const length = Number(contentLength);
    if (!Number.isNaN(length) && length === 0) {
      return false;
    }
  }

  const contentType = res.headers.get("content-type");
  if (!contentType) return false;

  return true;
}

async function performFetch<T>(
  fetcher: typeof fetch,
  request: ServerFetchRequest<T>,
  parse: (res: Response) => Promise<T>,
): Promise<ServerFetchResponse<T>> {
  const { cleanup, signal } = resolveSignal(request.signal, request.timeoutMs);
  const init: RequestInit = {
    ...(request.method ? { method: request.method } : {}),
    ...(request.headers ? { headers: request.headers } : {}),
    ...(request.body !== undefined ? { body: request.body } : {}),
    ...(signal ? { signal } : {}),
  };

  try {
    const res = await fetcher(request.url, init);
    let data: T;
    try {
      data = await parse(res);
    } catch (cause) {
      throw new ParseError(cause);
    }

    return {
      cached: false,
      data,
      meta: {},
      response: {
        headers: res.headers,
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        url: res.url,
      },
    };
  } finally {
    cleanup();
  }
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
