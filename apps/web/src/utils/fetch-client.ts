export class FetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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

interface Props {
  cache?: "force-cache" | "no-store";
  pathName: string;
  revalidate?: 0 | false | number;
  search?: Search;
  tags?: string[];
}

export async function fetchClient({
  revalidate,
  cache,
  pathName,
  search,
  tags,
}: Props) {
  try {
    const _queryingPathName = getQueryingPathName(pathName, search);
    const url = new URL(_queryingPathName, base);

    const res = await fetch(url, {
      ...(cache !== undefined && { cache }),
      next: {
        ...(revalidate !== undefined && { revalidate }),
        tags:
          tags === undefined
            ? [_queryingPathName]
            : [...tags, _queryingPathName],
      },
    });
    if (!res.ok) {
      throw new FetchError(res.statusText, res.status);
    }

    return await res.json();
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("unknown error");
  }
}

export function getQueryingPathName(pathName: string, search?: Search) {
  const params = new URLSearchParams(search);
  return search === undefined ? pathName : `${pathName}?${params.toString()}`;
}
