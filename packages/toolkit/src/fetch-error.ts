import { newError as baseNewError, type NewError } from "./error";

/** Minimal request metadata used to contextualize fetch failures.
 *
 * @public
 */
export type FetchRequest = {
  method?: string;
  url?: string;
};

/** Minimal response metadata captured when a fetch call resolves with an error status.
 *
 * @public
 */
export type FetchResponse = {
  status?: number;
  statusText?: string;
  url?: string;
};

/**
 * Payload accepted by {@link newFetchError} before shaping a toolkit error.
 * Mirrors {@link NewError} while adding fetch-specific request/response context.
 *
 * @public
 */
export type NewFetchError = {
  action?: string;
  cause?: unknown;
  hint?: string;
  impact?: string;
  request?: FetchRequest | undefined;
  /**
   * Custom label for the remote resource (falls back to {@link FetchRequest} / {@link FetchResponse}).
   * Useful when the underlying request data is redacted or derived (e.g. Next.js route aliases).
   */
  resource?: string;
  response?: FetchResponse | undefined;
};

type Classification = {
  defaultHint?: string;
  kind: Kind;
  problem: string;
};

type Kind = NewError["kind"];

/** Derives a concise `METHOD URL` label from request/response metadata.
 *
 * @public
 */
export function formatFetchTarget({
  request,
  response,
}: {
  request?: FetchRequest | undefined;
  response?: FetchResponse | undefined;
}): string | undefined {
  const method = request?.method?.trim();
  const url = request?.url ?? response?.url;
  if (method && url) return `${method.toUpperCase()} ${url}`;
  if (url) return url;
  return method?.toUpperCase();
}

/**
 * Builds an Error describing a failed fetch request using a consistent toolkit shape.
 *
 * Classification rules:
 * - HTTP 4xx/5xx responses map to semantic kinds (e.g. 401 → Unauthorized, 429 → RateLimit, 503 → Unavailable).
 * - Aborted/timeout signals map to `Timeout`.
 * - Network-level failures (DNS, connection refused, etc.) map to `Unavailable`.
 * - Unknown situations fall back to `Unknown`.
 *
 * The resulting `Error` is tagged with `layer: "External"` and a descriptive message that includes
 * the HTTP method/URL when available.
 *
 * @public
 */
export function newFetchError({
  action,
  cause,
  hint,
  impact,
  request,
  resource,
  response,
}: NewFetchError): Error {
  const classification = classifyFetchFailure({
    cause,
    request,
    response,
  });

  const target =
    resource ??
    formatFetchTarget({
      request,
      response,
    });
  const reason = target
    ? `${target} ${classification.problem}`
    : classification.problem;

  return baseNewError({
    action,
    cause,
    hint: hint ?? classification.defaultHint,
    impact,
    kind: classification.kind,
    layer: "External",
    reason,
  });
}

function classifyFetchFailure({
  cause,
  request,
  response,
}: {
  cause?: unknown;
  request?: FetchRequest | undefined;
  response?: FetchResponse | undefined;
}): Classification {
  const status = response?.status;
  if (typeof status === "number" && Number.isFinite(status) && status >= 100) {
    return classifyFromStatus(status, response?.statusText);
  }

  const causeClassification = classifyFromCause(cause);
  if (causeClassification) return causeClassification;

  const message = extractMessage(cause);
  const problem = message
    ? `failed with ${message}`
    : "encountered an unexpected error";

  return {
    kind: inferDefaultKind(request),
    problem,
  };
}

function classifyFromCause(cause: unknown): Classification | undefined {
  if (!cause) return;

  if (isAbortError(cause)) {
    return {
      defaultHint:
        "Check AbortController usage or increase the request timeout budget.",
      kind: "Timeout",
      problem: "was aborted before completing",
    };
  }

  const message = extractMessage(cause);
  if (!message) return;

  const lower = message.toLowerCase();
  if (/\btimeout|timed out\b/.test(lower)) {
    return {
      defaultHint: "Retry with a longer timeout or inspect upstream latency.",
      kind: "Timeout",
      problem: "timed out",
    };
  }

  if (
    /\bfetch failed\b/.test(lower) ||
    /\bfailed to fetch\b/.test(lower) ||
    /\bnetwork\b/.test(lower) ||
    /\bunreachable\b/.test(lower) ||
    /\bconnection\b/.test(lower) ||
    /\benotfound\b/.test(lower) ||
    /\beconnrefused\b/.test(lower) ||
    /\beconnreset\b/.test(lower) ||
    /\behostunreach\b/.test(lower) ||
    /\benetunreach\b/.test(lower) ||
    /\beai_again\b/.test(lower)
  ) {
    return {
      defaultHint: "Verify network connectivity or upstream availability.",
      kind: "Unavailable",
      problem: "failed due to a network error",
    };
  }

  return undefined;
}

function classifyFromStatus(
  status: number,
  statusText: string | undefined,
): Classification {
  const label = statusText ? `${status} ${statusText}` : `HTTP ${status}`;
  const problem = `responded with ${label}`;

  switch (status) {
    case 400:
    case 406:
    case 413:
    case 415:
    case 422:
    case 431:
      return {
        defaultHint: "Adjust the request payload or headers.",
        kind: "Validation",
        problem,
      };
    case 401:
      return {
        defaultHint: "Refresh credentials or login again.",
        kind: "Unauthorized",
        problem,
      };
    case 402:
    case 403:
    case 451:
      return {
        defaultHint: "Verify the caller has permission to access the resource.",
        kind: "Forbidden",
        problem,
      };
    case 404:
    case 410:
      return {
        defaultHint: "Verify the resource identifier or endpoint path.",
        kind: "NotFound",
        problem,
      };
    case 405:
    case 426:
    case 428:
      return {
        defaultHint:
          "Check that the HTTP method and prerequisites are correct.",
        kind: "Config",
        problem,
      };
    case 408:
    case 499:
      return {
        defaultHint:
          "Retry with a longer timeout or ensure the request is not aborted.",
        kind: "Timeout",
        problem,
      };
    case 409:
    case 412:
      return {
        defaultHint: "Resolve the conflicting state before retrying.",
        kind: "Conflict",
        problem,
      };
    case 423:
      return {
        defaultHint: "Ensure the resource is unlocked before retrying.",
        kind: "Conflict",
        problem,
      };
    case 429:
      return {
        defaultHint: "Slow down requests or increase the rate limit.",
        kind: "RateLimit",
        problem,
      };
    case 500:
      return {
        kind: "Unknown",
        problem,
      };
    case 502:
    case 503:
    case 507:
    case 508:
    case 509:
      return {
        defaultHint: "Retry later; the upstream service is unavailable.",
        kind: "Unavailable",
        problem,
      };
    case 504:
      return {
        defaultHint:
          "Retry with a longer timeout or investigate upstream latency.",
        kind: "Timeout",
        problem,
      };
    default:
      if (status >= 500 && status < 600) {
        return {
          kind: "Unavailable",
          problem,
        };
      }
      if (status >= 400 && status < 500) {
        return {
          kind: "Unknown",
          problem,
        };
      }
      return {
        kind: "Unknown",
        problem,
      };
  }
}

function extractMessage(cause: unknown): string | undefined {
  if (!cause) return;
  if (cause instanceof Error) return cause.message;
  if (typeof cause === "string") return cause;
  if (
    typeof cause === "object" &&
    "message" in (cause as Record<string, unknown>)
  ) {
    const message = (cause as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}

function inferDefaultKind(request?: FetchRequest): Kind {
  const method = request?.method?.toUpperCase() ?? "";
  return method === "GET" || method === "HEAD" ? "Unavailable" : "Unknown";
}

function isAbortError(cause: unknown): boolean {
  if (!cause) return false;
  const name =
    cause instanceof Error
      ? cause.name
      : typeof cause === "object" && cause
        ? (cause as { name?: unknown }).name
        : undefined;
  if (typeof name === "string" && name === "AbortError") return true;

  const message = extractMessage(cause);
  if (!message) return false;

  return /\babort(ed)?\b/.test(message) || /\babortcontroller\b/.test(message);
}
