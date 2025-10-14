import { newError as baseNewError, type NewError } from "./error";

/** Minimal request metadata used to contextualize fetch failures.
 *
 * @public
 */
export type FetchRequest = {
  method?: string;
  url?: string;
};

/**
 * Payload accepted by {@link newFetchError} before shaping a toolkit error.
 * Mirrors {@link NewError} while adding fetch-specific request context.
 *
 * @public
 */
export type NewFetchError = {
  action?: string;
  cause?: unknown;
  hint?: string;
  impact?: string;
  request?: FetchRequest | undefined;
};

type Classification = {
  defaultHint?: string;
  kind: Kind;
  problem: string;
};

type Kind = NewError["kind"];

/** Derives a concise `METHOD URL` label from request metadata.
 *
 * @public
 */
export function formatFetchTarget({
  request,
}: {
  request?: FetchRequest | undefined;
}): string | undefined {
  const method = request?.method?.trim();
  const url = request?.url;
  if (method && url) return `${method.toUpperCase()} ${url}`;
  if (url) return url;
  return method?.toUpperCase();
}

/**
 * Builds an Error describing a failed fetch request using a consistent toolkit shape.
 *
 * Classification rules:
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
}: NewFetchError): Error {
  const classification = classifyFetchFailure({
    cause,
    request,
  });

  const target = formatFetchTarget({
    request,
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
}: {
  cause?: unknown;
  request?: FetchRequest | undefined;
}): Classification {
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

function extractMessage(cause: unknown): string | undefined {
  if (!cause) return;
  if (cause instanceof Error) return truncate(cause.message);
  if (typeof cause === "string") return truncate(cause);
  if (
    typeof cause === "object" &&
    "message" in (cause as Record<string, unknown>)
  ) {
    const message = (cause as { message?: unknown }).message;
    return typeof message === "string" ? truncate(message) : undefined;
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

function truncate(value: string, max = 200): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}
