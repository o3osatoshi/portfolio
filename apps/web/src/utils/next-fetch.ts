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
  pathName: string;
  revalidate?: 0 | false | number;
  search?: Search;
  tags?: string[];
};

export function getQueryingPathName(pathName: string, search?: Search) {
  const params = new URLSearchParams(search);
  return search === undefined ? pathName : `${pathName}?${params.toString()}`;
}

export function nextFetch({
  revalidate,
  cache,
  pathName,
  search,
  tags,
}: Props): ResultAsync<NextFetchSuccess, Error> {
  const queryingPathName = getQueryingPathName(pathName, search);
  const url = new URL(queryingPathName, base);
  const effectiveTags =
    tags === undefined ? [queryingPathName] : [...tags, queryingPathName];
  const action = `Fetch ${queryingPathName}`;

  return ResultAsync.fromPromise(
    fetch(url, {
      ...(cache !== undefined && { cache }),
      next: {
        ...(revalidate !== undefined && { revalidate }),
        tags: effectiveTags,
      },
    }),
    (e) =>
      newFetchError({
        action,
        cause: e,
        request: {
          method: "GET",
          url: url.href,
        },
      }),
  ).andThen((res) =>
    ResultAsync.fromPromise(parseJsonBody(res), toError).map((body) => ({
      body,
      status: res.status,
    })),
  );
}

async function parseJsonBody(res: Response): Promise<unknown> {
  if (!shouldParseJson(res)) return undefined;

  return res.json();
}

function shouldParseJson(res: Response) {
  if (res.status === 204 || res.status === 205 || res.status === 304) {
    return false;
  }

  const contentLength = res.headers.get("content-length");
  if (contentLength !== null) {
    const numericLength = Number(contentLength);
    if (!Number.isNaN(numericLength) && numericLength === 0) {
      return false;
    }
  }

  const contentType = res.headers.get("content-type");
  if (!contentType) return false;

  return contentType.toLowerCase().includes("json");
}

function toError(input: unknown): Error {
  if (input instanceof Error) return input;
  return new Error(
    typeof input === "string" ? input : "Failed to parse response JSON",
  );
}
