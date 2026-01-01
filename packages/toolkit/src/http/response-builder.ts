import type { HttpResponse } from "./response-types";

/**
 * Optional metadata attached to a {@link HttpResponse}.
 *
 * @public
 */
export type BuildHttpResponseOptions = {
  /** Cache metadata attached by middleware. */
  cache?: { hit: boolean; key?: string };
  /** Retry metadata attached by middleware. */
  retry?: { attempts: number };
};

/**
 * Build a normalized {@link HttpResponse} from a parsed body and Fetch response.
 *
 * @param data - Parsed response body payload.
 * @param response - Fetch response metadata.
 * @param options - Optional cache/retry metadata.
 * @returns Normalized response payload.
 * @public
 */
export function buildHttpResponse<T = unknown>(
  data: T,
  response: Response,
  options: BuildHttpResponseOptions = {},
): HttpResponse<T> {
  return {
    data,
    response: {
      headers: response.headers,
      ok: response.ok,
      redirected: response.redirected,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    },
    ...(options.cache ? { cache: options.cache } : {}),
    ...(options.retry ? { retry: options.retry } : {}),
  };
}
