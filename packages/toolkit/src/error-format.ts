import type { Kind, Layer } from "./error";

/**
 * Utilities for composing and parsing structured error identifiers/messages
 * used throughout `@o3osatoshi/toolkit`.
 *
 * Consumers can call these helpers directly to build compatible error payloads
 * or to inspect JSON messages emitted by {@link composeErrorMessage}.
 *
 * @public
 */

const LAYER_VALUES = [
  "Application",
  "Auth",
  "DB",
  "Domain",
  "External",
  "Infra",
  "UI",
] as const satisfies readonly Layer[];

const KIND_VALUES = [
  "BadGateway",
  "BadRequest",
  "Canceled",
  "Config",
  "Conflict",
  "Deadlock",
  "Forbidden",
  "Integrity",
  "MethodNotAllowed",
  "NotFound",
  "RateLimit",
  "Serialization",
  "Timeout",
  "Unauthorized",
  "Unavailable",
  "Unknown",
  "Unprocessable",
  "Validation",
] as const satisfies readonly Kind[];

const MESSAGE_FORMAT_VERSION = 1;
const SUMMARY_FALLBACK = "Operation failed";
const ACTION_SUMMARY_SUFFIX = " failed";

/**
 * Structured representation of the human-friendly error message fields.
 *
 * @public
 */
export type ErrorMessageParts = {
  action?: string | undefined;
  causeText?: string | undefined;
  hint?: string | undefined;
  impact?: string | undefined;
  reason?: string | undefined;
};

/**
 * JSON payload shape produced by {@link composeErrorMessage}.
 *
 * @public
 */
export type ErrorMessagePayload = {
  summary: string;
  version: typeof MESSAGE_FORMAT_VERSION;
} & ErrorMessageParts;

/**
 * Compose a JSON-based error message to simplify parsing by consumers.
 *
 * @public
 */
export function composeErrorMessage(parts: ErrorMessageParts): string {
  const summary =
    parts.action && parts.action.trim().length > 0
      ? `${parts.action.trim()}${ACTION_SUMMARY_SUFFIX}`
      : SUMMARY_FALLBACK;

  const payload: ErrorMessagePayload = {
    summary,
    version: MESSAGE_FORMAT_VERSION,
  };

  if (parts.action) payload.action = parts.action;
  if (parts.reason) payload.reason = parts.reason;
  if (parts.impact) payload.impact = parts.impact;
  if (parts.hint) payload.hint = parts.hint;
  if (parts.causeText) payload.causeText = parts.causeText;

  return JSON.stringify(payload);
}

/**
 * Build an error `name` string such as `DomainValidationError`.
 *
 * @public
 */
export function composeErrorName(layer: Layer, kind: Kind): string {
  return `${layer}${kind}Error`;
}

/**
 * Parse the JSON payload created by {@link composeErrorMessage}.
 *
 * @public
 */
export function parseErrorMessage(
  message: string | undefined,
): ErrorMessageParts {
  const payload = parsePayload(message);
  if (!payload) return {};
  const parts: ErrorMessageParts = {};

  if (isString(payload.action)) parts.action = payload.action;
  if (isString(payload.reason)) parts.reason = payload.reason;
  if (isString(payload.impact)) parts.impact = payload.impact;
  if (isString(payload.hint)) parts.hint = payload.hint;
  if (isString(payload.causeText)) parts.causeText = payload.causeText;

  return parts;
}

/**
 * Attempt to recover `layer` and `kind` from a structured error `name`.
 *
 * @public
 */
export function parseErrorName(name: string | undefined): {
  kind?: Kind;
  layer?: Layer;
} {
  if (!name || !name.endsWith("Error")) return {};
  const withoutSuffix = name.slice(0, -5);
  const layer = LAYER_VALUES.find((candidate) =>
    withoutSuffix.startsWith(candidate),
  );
  if (!layer) return {};
  const remaining = withoutSuffix.slice(layer.length);
  const kind = KIND_VALUES.find((candidate) => candidate === remaining);
  return kind ? { kind, layer } : { layer };
}

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function parsePayload(
  message: string | undefined,
): ErrorMessagePayload | undefined {
  if (!message) return undefined;
  let data: unknown;
  try {
    data = JSON.parse(message);
  } catch {
    return undefined;
  }
  if (!isJsonRecord(data)) return undefined;
  const version = data["version"];
  if (version !== MESSAGE_FORMAT_VERSION) return undefined;
  const summary = data["summary"];
  if (!isString(summary)) return undefined;
  return data as ErrorMessagePayload;
}
