/**
 * Minimal request metadata used to describe an HTTP call.
 *
 * @public
 */
export type HttpRequestMeta = {
  /** HTTP method (for example "GET"). */
  method: string;
  /** Fully qualified request URL. */
  url: string;
};

/**
 * Normalized HTTP response payload returned by toolkit fetch helpers.
 *
 * @public
 */
export type HttpResponse<T = unknown> = {
  /** Optional cache metadata attached by middleware. */
  cache?: {
    /** Whether the response was served from cache. */
    hit: boolean;
    /** Optional cache key that produced the hit/miss. */
    key?: string;
  };
  /** Parsed response body. */
  data: T;
  /** Response metadata snapshot. */
  response: {
    /** Response headers as provided by Fetch. */
    headers: Headers;
    /** Whether the response status is within the 2xx range. */
    ok: boolean;
    /** Whether the response was the result of a redirect. */
    redirected?: boolean;
    /** HTTP status code. */
    status: number;
    /** HTTP status text (for example "OK"). */
    statusText: string;
    /** Final response URL after redirects. */
    url: string;
  };
  /** Optional retry metadata attached by middleware. */
  retry?: {
    /** Number of attempts performed before returning. */
    attempts: number;
  };
};
