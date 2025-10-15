import { newError as baseNewError, type NewError } from "./error";
import { extractErrorMessage, extractErrorName } from "./error-attributes";

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
  hint?: string;
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
    hint: hint ?? classification.hint,
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
  const classification = classifyFromCause(cause);
  if (classification) return classification;

  const message = extractErrorMessage(cause);
  const problem = message
    ? `failed with ${message}`
    : "encountered an unexpected error";

  return {
    kind: inferKind(request),
    problem,
  };
}

function classifyFromCause(cause: unknown): Classification | undefined {
  if (!cause) return;

  if (isAbortError(cause)) {
    return {
      hint: "Check AbortController usage or increase the request timeout budget.",
      kind: "Timeout",
      problem: "was aborted before completing",
    };
  }

  const message = extractErrorMessage(cause);
  if (!message) return;
  const lowerMessage = message.toLowerCase();

  if (/\btimeout|timed out\b/.test(lowerMessage)) {
    return {
      hint: "Retry with a longer timeout or inspect upstream latency.",
      kind: "Timeout",
      problem: "timed out",
    };
  }

  if (
    /\bfetch failed\b/.test(lowerMessage) ||
    /\bfailed to fetch\b/.test(lowerMessage) ||
    /\bnetwork\b/.test(lowerMessage) ||
    /\bunreachable\b/.test(lowerMessage) ||
    /\bconnection\b/.test(lowerMessage) ||
    /\benotfound\b/.test(lowerMessage) ||
    /\beconnrefused\b/.test(lowerMessage) ||
    /\beconnreset\b/.test(lowerMessage) ||
    /\behostunreach\b/.test(lowerMessage) ||
    /\benetunreach\b/.test(lowerMessage) ||
    /\beai_again\b/.test(lowerMessage)
  ) {
    return {
      hint: "Verify network connectivity or upstream availability.",
      kind: "Unavailable",
      problem: "failed due to a network error",
    };
  }

  return undefined;
}

function inferKind(request?: FetchRequest): Kind {
  const method = request?.method?.toUpperCase();
  return method === "GET" || method === "HEAD" ? "Unavailable" : "Unknown";
}

function isAbortError(cause: unknown): boolean {
  if (!cause) return false;

  const name = extractErrorName(cause);
  if (name === "AbortError") return true;

  const message = extractErrorMessage(cause);
  if (!message) return false;

  return /\babort(ed)?\b/.test(message) || /\babortcontroller\b/.test(message);
}
