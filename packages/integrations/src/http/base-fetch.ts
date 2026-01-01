import { ResultAsync } from "neverthrow";
import type { z } from "zod";

import { type Layer, newFetchError, parseAsyncWith } from "@o3osatoshi/toolkit";

import type {
  SmartFetch,
  SmartFetchRequest,
  SmartFetchResponse,
} from "./smart-fetch-types";

export type CreateSmartFetchOptions = {
  fetch?: typeof fetch;
};

export function createBaseFetch(
  options: CreateSmartFetchOptions = {},
): SmartFetch {
  const fetcher = options.fetch ?? fetch;

  return <S extends z.ZodType>(
    request: SmartFetchRequest<S>,
  ): ResultAsync<SmartFetchResponse<z.infer<S>>, Error> => {
    const method = (request.method ?? "GET").toUpperCase();
    const requestMeta = { method, url: request.url };

    const parseContext = request.parseContext ?? {
      action: "ParseExternalApiResponse",
      layer: "External" as const,
    };

    return ResultAsync.fromPromise(
      performFetch(fetcher, request, parseContext),
      (cause) => {
        // Errors from newFetchError or newZodError have specific naming patterns
        // e.g., "ExternalBadGatewayError", "ExternalValidationError"
        if (
          cause instanceof Error &&
          (cause.name.includes("BadGateway") ||
            cause.name.includes("Validation") ||
            cause.name.includes("NotFound") ||
            cause.name.includes("Unauthorized") ||
            cause.name.includes("Forbidden") ||
            cause.name.includes("RateLimit") ||
            cause.name.includes("Unavailable") ||
            cause.name.includes("Timeout"))
        ) {
          return cause;
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

async function performFetch<S extends z.ZodType>(
  fetcher: typeof fetch,
  request: SmartFetchRequest<S>,
  parseContext: { action: string; layer?: Layer },
): Promise<SmartFetchResponse<z.infer<S>>> {
  const { cleanup, signal } = resolveSignal(request.signal, request.timeoutMs);
  const init: RequestInit = {
    ...(request.method ? { method: request.method } : {}),
    ...(request.headers ? { headers: request.headers } : {}),
    ...(request.body !== undefined ? { body: request.body } : {}),
    ...(signal ? { signal } : {}),
  };

  try {
    const res = await fetcher(request.url, init);

    let json: unknown;
    try {
      json = await res.json();
    } catch (cause) {
      throw newFetchError({
        action: "DeserializeResponseBody",
        cause,
        kind: "BadGateway",
        request: { method: request.method ?? "GET", url: request.url },
      });
    }

    const parseResult = await parseAsyncWith(
      request.schema,
      parseContext,
    )(json).match(
      (data) => ({ data, success: true as const }),
      (error) => ({ error, success: false as const }),
    );

    if (!parseResult.success) {
      throw parseResult.error;
    }

    return {
      cached: false,
      data: parseResult.data,
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
