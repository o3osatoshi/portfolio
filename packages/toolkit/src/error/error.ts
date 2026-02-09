import type { JsonObject } from "../types";
import { extractErrorMessage, extractErrorName } from "./error-attributes";
import type {
  Kind,
  Layer,
  RichErrorDetails,
  RichErrorI18n,
} from "./error-schema";

export type {
  Kind,
  Layer,
  RichErrorDetails,
  RichErrorI18n,
} from "./error-schema";

/**
 * Input payload used when creating {@link RichError}.
 *
 * @public
 */
export type NewRichError = {
  /** Original cause (any type) captured for diagnostic context. */
  cause?: unknown;
  /** Machine-stable identifier (analytics / i18n routing / client logic). */
  code?: string | undefined;
  /** Additional human context intended for diagnostics. */
  details?: RichErrorDetails | undefined;
  /** UI-friendly i18n key + params (not translated here). */
  i18n?: RichErrorI18n | undefined;
  /** Indicates whether the error is an expected operational failure. */
  isOperational: boolean;
  /** High-level error classification shared across layers. */
  kind: Kind;
  /** Architectural layer where the failure originated. */
  layer: Layer;
  /** JSON-safe metadata (diagnostics, debugging, metrics). */
  meta?: JsonObject | undefined;
};

const RICH_ERROR_BRAND = Symbol.for("@o3osatoshi/rich-error");

const SUPPORTS_ERROR_CAUSE = (() => {
  try {
    const ctor = Error as unknown as new (
      m?: string,
      o?: { cause?: unknown },
    ) => Error;
    new ctor("probe", { cause: "probe" });
    return true;
  } catch {
    return false;
  }
})();

/**
 * Structured Error subclass used across the monorepo.
 *
 * @public
 */
export class RichError extends Error {
  readonly code: string | undefined;
  readonly details: RichErrorDetails | undefined;
  readonly i18n: RichErrorI18n | undefined;
  readonly isOperational: boolean;
  readonly kind: Kind;
  readonly layer: Layer;
  readonly meta: JsonObject | undefined;
  readonly [RICH_ERROR_BRAND] = true;

  constructor(params: NewRichError, messageOverride?: string) {
    const name = composeErrorName(params.layer, params.kind);
    const summary =
      messageOverride ?? buildErrorSummary(params.details) ?? name;
    const cause = params.cause;

    if (SUPPORTS_ERROR_CAUSE) {
      super(summary, cause !== undefined ? { cause } : undefined);
    } else {
      super(summary);
      if (cause !== undefined) {
        attachCause(this, cause);
      }
    }

    this.name = name;
    this.kind = params.kind;
    this.layer = params.layer;
    this.code = params.code;
    this.i18n = params.i18n;
    this.details = params.details;
    this.meta = params.meta;
    this.isOperational = params.isOperational;
  }
}

/**
 * Build a simple, human-readable summary for an error.
 *
 * @public
 */
export function buildErrorSummary(
  details: RichErrorDetails | undefined,
): string | undefined {
  if (!details) return undefined;
  const action = details.action?.trim();
  const reason = details.reason?.trim();
  if (action && reason) return `${action} failed: ${reason}`;
  if (action) return `${action} failed`;
  if (reason) return reason;
  if (details.impact) return details.impact;
  if (details.hint) return details.hint;
  return undefined;
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
 * Type guard for {@link RichError}.
 *
 * @public
 */
export function isRichError(error: unknown): error is RichError {
  if (!error || typeof error !== "object") return false;
  if (error instanceof RichError) return true;
  return (error as { [RICH_ERROR_BRAND]?: boolean })[RICH_ERROR_BRAND] === true;
}

/**
 * Construct a {@link RichError}.
 *
 * @public
 */
export function newRichError(params: NewRichError): RichError {
  return new RichError(params);
}

/**
 * Derive default operationality from error kind.
 *
 * @public
 */
export function resolveOperationalFromKind(kind: Kind): boolean {
  switch (kind) {
    case "Internal":
    case "Serialization":
      return false;
    default:
      return true;
  }
}

/**
 * Normalize an unknown value into a {@link RichError}.
 *
 * @remarks
 * - Returns the input as-is when it is already a {@link RichError}.
 * - Fills missing `details.reason` from the source error message when possible.
 * - Adds normalization metadata (`normalizedBy`, `normalizedFromType`,
 *   `normalizedFromName`) while preserving caller-provided `fallback.meta`.
 *
 * @public
 */
export function toRichError(
  error: unknown,
  fallback: Partial<NewRichError> = {},
): RichError {
  if (isRichError(error)) return error;

  const details = mergeRichErrorDetails(
    fallback.details,
    extractErrorMessage(error),
  );

  const kind = fallback.kind ?? "Internal";
  const meta = mergeRichErrorMeta(fallback.meta, error);

  return newRichError({
    cause: error,
    code: fallback.code ?? "RICH_ERROR_NORMALIZED",
    details,
    i18n: fallback.i18n,
    isOperational: fallback.isOperational ?? resolveOperationalFromKind(kind),
    kind,
    layer: fallback.layer ?? "External",
    meta,
  });
}

function attachCause(error: Error, cause: unknown) {
  try {
    Object.defineProperty(error, "cause", {
      enumerable: false,
      value: cause,
    });
  } catch {
    // ignore defineProperty failure
  }
}

function mergeRichErrorDetails(
  details: RichErrorDetails | undefined,
  extractedReason: string | undefined,
): RichErrorDetails | undefined {
  if (!details && extractedReason === undefined) {
    return undefined;
  }

  if (!details) {
    return { reason: extractedReason };
  }

  if (details.reason !== undefined || extractedReason === undefined) {
    return details;
  }

  return { ...details, reason: extractedReason };
}

function mergeRichErrorMeta(
  meta: JsonObject | undefined,
  source: unknown,
): JsonObject {
  const sourceName = extractErrorName(source);

  return {
    normalizedBy: "toolkit.toRichError",
    normalizedFromType: resolveSourceType(source),
    ...(sourceName ? { normalizedFromName: sourceName } : {}),
    ...(meta ?? {}),
  };
}

function resolveSourceType(source: unknown): string {
  if (source === null) return "null";
  if (Array.isArray(source)) return "array";
  return typeof source;
}
