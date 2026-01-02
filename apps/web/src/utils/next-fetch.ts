import { ResultAsync } from "neverthrow";

import { env } from "@/env/client";
import {
  buildHttpResponse,
  deserializeResponseBody,
  type HttpRequest,
  type HttpResponse,
  newFetchError,
} from "@o3osatoshi/toolkit";

export type NextFetchRequest = {
  cache?: "force-cache" | "no-store";
  headers?: HeadersInit;
  /**
   * Absolute or relative path for an external HTTP service.
   *
   * When combined with {@link env.NEXT_PUBLIC_API_BASE_URL} this yields the
   * full URL used for the underlying fetch.
   */
  path: string;
  revalidate?: 0 | false | number;
  search?: Search;
  tags?: string[];
};

/**
 * Query string shape for external HTTP services.
 *
 * Internal API calls (e.g. `/api/*`, `/edge/*`) should go through
 * the typed Hono RPC client instead of this helper.
 */
export type Search =
  | Record<string, string>
  | string
  | string[][]
  | undefined
  | URLSearchParams;

export function getQueryPath(path: string, search?: Search) {
  const params = new URLSearchParams(search);
  return search === undefined ? path : `${path}?${params.toString()}`;
}

/**
 * Thin wrapper around `fetch` for external HTTP services with:
 * - Next.js `next` options (cache, tags, revalidate)
 * - structured `Error` via `newFetchError`
 *
 * Note: for the portfolio's own interface API, prefer the Hono RPC client
 * (`@repo/interface/rpc-client`) instead of this helper.
 */
export function nextFetch(
  request: NextFetchRequest,
): ResultAsync<HttpResponse, Error> {
  const queryPath = getQueryPath(request.path, request.search);
  const url = new URL(queryPath, env.NEXT_PUBLIC_API_BASE_URL);
  const requestMeta: HttpRequest = { method: "GET", url: url.href };

  const _tags =
    request.tags === undefined ? [queryPath] : [...request.tags, queryPath];

  return ResultAsync.fromPromise(
    fetch(url, {
      ...(request.cache !== undefined ? { cache: request.cache } : {}),
      ...(request.headers !== undefined ? { headers: request.headers } : {}),
      next: {
        ...(request.revalidate !== undefined
          ? { revalidate: request.revalidate }
          : {}),
        tags: _tags,
      },
    }),
    (cause) =>
      newFetchError({
        action: `Fetch ${queryPath}`,
        cause,
        request: requestMeta,
      }),
  ).andThen((response) =>
    ResultAsync.fromPromise(deserializeResponseBody(response), (cause) =>
      newFetchError({
        action: `Deserialize body for ${queryPath}`,
        cause,
        kind: "Serialization",
        request: requestMeta,
      }),
    ).map((data) =>
      buildHttpResponse(data, response, {
        // Next.js specific metadata could be added here if needed
      }),
    ),
  );
}
