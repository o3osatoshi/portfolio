import { ResultAsync } from "neverthrow";

import { isDeserializableBody, newFetchError } from "@o3osatoshi/toolkit";

import type {
  BetterFetchClient,
  BetterFetchRequest,
  BetterFetchResponse,
} from "./better-fetch-types";

export type CreateBetterFetchOptions = {
  fetch?: typeof fetch;
};

class ParseError extends Error {
  constructor(override readonly cause: unknown) {
    super("Failed to parse response body");
  }
}

export function createBetterFetch(
  options: CreateBetterFetchOptions = {},
): BetterFetchClient {
  const fetcher = options.fetch ?? fetch;

  return <T>(
    request: BetterFetchRequest<T>,
  ): ResultAsync<BetterFetchResponse<T>, Error> => {
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

async function performFetch<T>(
  fetcher: typeof fetch,
  request: BetterFetchRequest<T>,
  parse: (res: Response) => Promise<T>,
): Promise<BetterFetchResponse<T>> {
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
