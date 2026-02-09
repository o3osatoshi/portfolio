import type { Kind } from "../error";
import { truncate } from "../truncate";

/**
 * Inputs for {@link formatHttpStatusReason}.
 *
 * @public
 */
export type FormatHttpStatusReasonOptions = {
  /**
   * Maximum payload length before truncation. Use `null` to disable truncation.
   * When omitted, the default truncation length is applied.
   */
  maxPayloadLength?: null | number;
  /** Response payload used to build a compact preview. */
  payload: unknown;
  /** Response object providing status metadata. */
  response: HttpStatusLike;
  /** External service name to include in the formatted reason. */
  serviceName: string;
};

/**
 * Error kinds produced by {@link httpStatusToKind}.
 *
 * @public
 */
export type HttpStatusKind = Extract<
  Kind,
  | "BadGateway"
  | "BadRequest"
  | "Forbidden"
  | "Internal"
  | "NotFound"
  | "RateLimit"
  | "Timeout"
  | "Unauthorized"
>;

/**
 * Minimal HTTP response shape used for status formatting helpers.
 *
 * @public
 */
export type HttpStatusLike = {
  /** HTTP status code. */
  status: number;
  /** HTTP status text (for example "Not Found"). */
  statusText: string;
};

/**
 * Options for {@link createUrlRedactor}.
 *
 * @public
 */
export type UrlRedactorOptions = {
  /** Placeholder string used to replace matched secrets. */
  placeholder?: string;
  /** Secrets to redact from URL strings. */
  secrets: Array<string | undefined>;
};

/**
 * Create a URL redactor that replaces configured secrets with a placeholder.
 *
 * @param options - Redactor options.
 * @returns Function that redacts secrets in URLs.
 * @public
 */
export function createUrlRedactor(options: UrlRedactorOptions) {
  const placeholder = options.placeholder ?? "<redacted>";
  const secrets = options.secrets.filter((value): value is string =>
    Boolean(value),
  );

  if (secrets.length === 0) {
    return (url: string) => url;
  }

  return (url: string) => {
    let redacted = url;
    for (const secret of secrets) {
      redacted = redacted.split(secret).join(placeholder);
    }
    return redacted;
  };
}

/**
 * Format a human-readable status reason string for external HTTP calls.
 *
 * @param serviceName - External service name.
 * @param response - HTTP status metadata.
 * @param payload - Response payload previewed for context.
 * @param maxPayloadLength - Optional truncation length for payload preview.
 * @returns Formatted reason string.
 * @public
 */
export function formatHttpStatusReason({
  maxPayloadLength,
  payload,
  response,
  serviceName,
}: FormatHttpStatusReasonOptions): string {
  const formatted = formatPayloadPreview(payload);
  const summary = formatted ? `: ${truncate(formatted, maxPayloadLength)}` : "";
  return `${serviceName} responded with ${response.status} ${response.statusText}${summary}`;
}

/**
 * Convert an arbitrary payload into a compact string representation for logging.
 *
 * @param payload - Payload value to format.
 * @returns String representation suitable for diagnostics.
 * @public
 */
export function formatPayloadPreview(payload: unknown): string {
  if (payload === null) return "null";
  if (payload === undefined) return "";
  if (typeof payload === "string") return payload;
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

/**
 * Map HTTP status codes to toolkit error kinds.
 *
 * @param status - HTTP status code.
 * @returns Classified {@link Kind} value.
 * @public
 */
export function httpStatusToKind(status: number): HttpStatusKind {
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "NotFound";
  if (status === 408) return "Timeout";
  if (status === 429) return "RateLimit";
  if (status >= 400 && status < 500) return "BadRequest";
  if (status >= 500 && status < 600) return "BadGateway";
  return "Internal";
}

/**
 * Heuristic to detect whether a response body should be deserialized.
 *
 * Rules:
 * - 204, 205, and 304 responses are considered empty.
 * - content-length: 0 is considered empty.
 * - A missing content-type header is considered empty.
 *
 * Note: this does not validate or parse content types.
 *
 * @param res - Fetch response to inspect.
 * @returns `true` when a body is likely present.
 * @public
 */
export function isDeserializableBody(res: Response) {
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

  return true;
}

/**
 * Ensure a base URL ends with a trailing slash, which makes URL resolution
 * with {@link https://developer.mozilla.org/en-US/docs/Web/API/URL | URL} predictable.
 *
 * @param baseUrl - Base URL to normalize.
 * @returns The normalized base URL with a trailing slash.
 * @public
 */
export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}
