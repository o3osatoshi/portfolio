import { ResultAsync } from "neverthrow";

import { newFetchError } from "@o3osatoshi/toolkit";

const base = process.env["NEXT_PUBLIC_API_BASE_URL"];
if (base === undefined) {
  throw new Error("API_BASE_URL is undefined");
}

export type Search =
  | Record<string, string>
  | string
  | string[][]
  | undefined
  | URLSearchParams;

type NextFetchSuccess = {
  body: unknown;
  status: number;
};

type Props = {
  cache?: "force-cache" | "no-store";
  path: string;
  revalidate?: 0 | false | number;
  search?: Search;
  tags?: string[];
};

export function getQueryPath(path: string, search?: Search) {
  const params = new URLSearchParams(search);
  return search === undefined ? path : `${path}?${params.toString()}`;
}

export function nextFetch({
  revalidate,
  cache,
  path,
  search,
  tags,
}: Props): ResultAsync<NextFetchSuccess, Error> {
  const queryPath = getQueryPath(path, search);

  const url = new URL(queryPath, base);

  const _tags = tags === undefined ? [queryPath] : [...tags, queryPath];

  return ResultAsync.fromPromise(
    fetch(url, {
      ...(cache !== undefined ? { cache } : {}),
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
      status: res.status,
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
