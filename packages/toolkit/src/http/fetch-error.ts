import {
  extractErrorMessage,
  extractErrorName,
  type Kind,
  type NewRichError,
  newRichError,
  resolveOperationalFromKind,
  type RichError,
  type RichErrorDetails,
} from "../error";

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
 * Mirrors {@link NewRichError} while adding fetch-specific request context.
 * When `kind` is omitted, the helper falls back to the classification derived
 * from the request metadata or underlying cause.
 *
 * @public
 */
export type NewFetchError = {
  cause?: unknown;
  details?: RichErrorDetails | undefined;
  isOperational?: boolean | undefined;
  kind?: Kind | undefined;
  request?: FetchRequest | undefined;
} & Omit<NewRichError, "details" | "isOperational" | "kind" | "layer">;

type Classification = {
  hint?: string;
  kind: Kind;
  problem: string;
};

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
 * - Other situations fall back to `Internal`.
 *
 * The resulting `Error` is tagged with `layer: "External"` and a descriptive message that includes
 * the HTTP method/URL when available.
 * Providing `kind` allows overriding the inferred classification when callers have stronger context.
 *
 * @public
 */
export function newFetchError({
  cause,
  details,
  isOperational,
  kind,
  request,
  ...rest
}: NewFetchError): RichError {
  const classification = classifyFetchFailure({
    cause,
    request,
  });

  const target = formatFetchTarget({
    request,
  });
  const resolvedKind = kind ?? classification.kind;
  const reason = target
    ? `${target} ${classification.problem}`
    : classification.problem;

  return newRichError({
    ...rest,
    cause,
    code: rest.code ?? resolveFetchErrorCode(resolvedKind),
    details: {
      ...details,
      action: details?.action ?? "FetchExternalApi",
      hint: details?.hint ?? classification.hint,
      reason: details?.reason ?? reason,
    },
    isOperational: isOperational ?? resolveOperationalFromKind(resolvedKind),
    kind: resolvedKind,
    layer: "External",
    meta: resolveFetchMeta({
      cause,
      inferredKind: classification.kind,
      request,
      resolvedKind,
      target,
      userMeta: rest.meta,
    }),
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

  if (/\b(?:timeout|timed out)\b/.test(lowerMessage)) {
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
  return method === "GET" || method === "HEAD" ? "Unavailable" : "Internal";
}

function isAbortError(cause: unknown): boolean {
  if (!cause) return false;

  const name = extractErrorName(cause);
  if (name === "AbortError") return true;

  const message = extractErrorMessage(cause);
  if (!message) return false;

  return /\babort(ed)?\b/.test(message) || /\babortcontroller\b/.test(message);
}

function resolveFetchErrorCode(kind: Kind): string {
  switch (kind) {
    case "BadGateway":
      return "FETCH_BAD_GATEWAY";
    case "BadRequest":
      return "FETCH_BAD_REQUEST";
    case "Canceled":
      return "FETCH_CANCELED";
    case "Conflict":
      return "FETCH_CONFLICT";
    case "Forbidden":
      return "FETCH_FORBIDDEN";
    case "MethodNotAllowed":
      return "FETCH_METHOD_NOT_ALLOWED";
    case "NotFound":
      return "FETCH_NOT_FOUND";
    case "RateLimit":
      return "FETCH_RATE_LIMIT";
    case "Serialization":
      return "FETCH_SERIALIZATION";
    case "Timeout":
      return "FETCH_TIMEOUT";
    case "Unauthorized":
      return "FETCH_UNAUTHORIZED";
    case "Unavailable":
      return "FETCH_UNAVAILABLE";
    case "Unprocessable":
      return "FETCH_UNPROCESSABLE";
    case "Validation":
      return "FETCH_VALIDATION";
    default:
      return "FETCH_INTERNAL";
  }
}

function resolveFetchMeta({
  cause,
  inferredKind,
  request,
  resolvedKind,
  target,
  userMeta,
}: {
  cause?: unknown;
  inferredKind: Kind;
  request?: FetchRequest | undefined;
  resolvedKind: Kind;
  target: string | undefined;
  userMeta: NewRichError["meta"];
}): NewRichError["meta"] {
  const method = request?.method?.trim().toUpperCase();
  const url = request?.url;
  const causeName = extractErrorName(cause);

  return {
    fetchKindOverridden: inferredKind !== resolvedKind,
    fetchCauseType: resolveSourceType(cause),
    fetchInferredKind: inferredKind,
    fetchResolvedKind: resolvedKind,
    fetchSource: "toolkit.newFetchError",
    ...(method ? { fetchMethod: method } : {}),
    ...(url ? { fetchUrl: url } : {}),
    ...(target ? { fetchTarget: target } : {}),
    ...(causeName ? { fetchCauseName: causeName } : {}),
    ...(userMeta ?? {}),
  };
}

function resolveSourceType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
