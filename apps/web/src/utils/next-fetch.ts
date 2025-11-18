import { ResultAsync } from "neverthrow";

import { env } from "@/env/client";
import { newFetchError } from "@o3osatoshi/toolkit";

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

type NextFetchResponse = {
  body: unknown;
} & Pick<Response, "ok" | "redirected" | "status" | "statusText" | "url">;

type Props = {
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
export function nextFetch({
  revalidate,
  cache,
  headers,
  path,
  search,
  tags,
}: Props): ResultAsync<NextFetchResponse, Error> {
  const queryPath = getQueryPath(path, search);

  const url = new URL(queryPath, env.NEXT_PUBLIC_API_BASE_URL);

  const _tags = tags === undefined ? [queryPath] : [...tags, queryPath];

  return ResultAsync.fromPromise(
    fetch(url, {
      ...(cache !== undefined ? { cache } : {}),
      ...(headers !== undefined ? { headers } : {}),
      next: {
        ...(revalidate !== undefined ? { revalidate } : {}),
        tags: _tags,
      },
    }),
    (e) =>
      newFetchError({
        action: `Fetch ${queryPath}`,
        cause: e,
        request: {
          method: "GET",
          url: url.href,
        },
      }),
  ).andThen((res) =>
    ResultAsync.fromPromise(deserializeBody(res), (e) =>
      newFetchError({
        action: `Deserialize body for ${queryPath}`,
        cause: e,
        kind: "Serialization",
        request: {
          method: "GET",
          url: url.href,
        },
      }),
    ).map((body) => ({
      body,
      ok: res.ok,
      redirected: res.redirected,
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    })),
  );
}

async function deserializeBody(res: Response): Promise<unknown> {
  if (!isDeserializableBody(res)) return undefined;

  return res.json();
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

  return contentType.toLowerCase().includes("json");
}
