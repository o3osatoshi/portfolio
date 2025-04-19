export class FetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const base = process.env.API_BASE_URL;
if (base === undefined) {
  throw new Error("API_BASE_URL is undefined");
}

interface Props {
  pathName: string;
  search?:
    | string
    | string[][]
    | Record<string, string>
    | URLSearchParams
    | undefined;
  cache?: "force-cache" | "no-store";
  revalidate?: false | 0 | number;
  tags?: string[];
}

export async function fetchClient({
  pathName,
  search,
  cache,
  revalidate,
  tags,
}: Props) {
  try {
    const params = new URLSearchParams(search);
    const _fullPath =
      search === undefined ? pathName : `${pathName}?${params.toString()}`;
    const url = new URL(_fullPath, base);

    const res = await fetch(url, {
      ...(cache !== undefined && { cache }),
      next: {
        ...(revalidate !== undefined && { revalidate }),
        ...(tags !== undefined && { tags }),
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
