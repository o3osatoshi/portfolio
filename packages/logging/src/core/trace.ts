/**
 * Trace context identifiers aligned with OpenTelemetry naming.
 *
 * @public
 */
export type TraceContext = {
  /**
   * Optional parent span identifier.
   */
  parentSpanId?: string;
  /**
   * Span identifier (16 hex chars).
   */
  spanId: string;
  /**
   * Optional trace flags (2 hex chars).
   */
  traceFlags?: string;
  /**
   * Trace identifier (32 hex chars).
   */
  traceId: string;
};

const TRACE_ID_BYTES = 16;
const SPAN_ID_BYTES = 8;

/**
 * Create a trace context from explicit values or a `traceparent` header.
 *
 * @param input - Optional identifiers and traceparent header.
 *
 * @remarks
 * Invalid identifiers are ignored and regenerated.
 *
 * @throws
 * Throws when Web Crypto is unavailable and new identifiers are required.
 *
 * @public
 */
export function createTraceContext(input?: {
  spanId?: string | undefined;
  traceId?: string | undefined;
  traceparent?: string | undefined;
}): TraceContext {
  const parsed = parseTraceparent(input?.traceparent);

  const traceId = isValidHex(input?.traceId, 32)
    ? input?.traceId
    : (parsed?.traceId ?? randomHex(TRACE_ID_BYTES));

  const spanId = isValidHex(input?.spanId, 16)
    ? input?.spanId
    : randomHex(SPAN_ID_BYTES);

  const context: TraceContext = {
    spanId,
    traceId,
  };

  if (parsed?.spanId) {
    context.parentSpanId = parsed.spanId;
  }
  if (parsed?.traceFlags) {
    context.traceFlags = parsed.traceFlags;
  }

  return context;
}

/**
 * Format a W3C `traceparent` header value.
 *
 * @param context - Trace identifiers used to construct the header.
 * @param flags - Optional trace flags (defaults to `01`).
 *
 * @throws
 * Throws when `flags` is not a 2-character hex string.
 *
 * @public
 */
export function formatTraceparent(context: TraceContext, flags = "01"): string {
  if (!isValidHex(flags, 2)) {
    throw new Error("traceparent flags must be a 2-character hex string");
  }

  const version = "00";
  const traceId = context.traceId;
  const spanId = context.spanId;
  return `${version}-${traceId}-${spanId}-${flags}`;
}

/**
 * Parse a W3C `traceparent` header value.
 *
 * @remarks
 * Returns `undefined` when the header is missing or invalid.
 *
 * @public
 */
export function parseTraceparent(
  value?: string,
): { spanId: string; traceFlags: string; traceId: string } | undefined {
  if (!value) return undefined;

  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  const parts = trimmedValue.split("-");
  if (parts.length !== 4) return undefined;

  const [version, traceId, spanId, traceFlags] = parts;
  if (!isValidHex(version, 2)) return undefined;
  if (!isValidHex(traceId, 32) || traceId === "0".repeat(32)) return undefined;
  if (!isValidHex(spanId, 16) || spanId === "0".repeat(16)) return undefined;
  if (!isValidHex(traceFlags, 2)) return undefined;

  return { spanId, traceFlags, traceId };
}

function isValidHex(
  value: string | undefined,
  length: number,
): value is string {
  if (!value) return false;
  if (value.length !== length) return false;
  return /^[0-9a-f]+$/i.test(value);
}

function randomHex(bytes: number): string {
  const buffer = new Uint8Array(bytes);

  const crypto = globalThis.crypto;
  if (!crypto?.getRandomValues) {
    throw new Error(
      "crypto.getRandomValues is required to generate trace/span identifiers",
    );
  }
  crypto.getRandomValues(buffer);

  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
