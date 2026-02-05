import type { JsonObject } from "../types";
import { extractErrorMessage, extractErrorName } from "./error-attributes";
import { composeErrorName, parseErrorName } from "./error-name";
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
  isOperational?: boolean | undefined;
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
    this.isOperational = params.isOperational ?? true;
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
 * Resolve kind/layer from known error forms.
 *
 * @public
 */
export function resolveErrorInfo(error: unknown): {
  kind?: Kind;
  layer?: Layer;
} {
  if (isRichError(error)) {
    return { kind: error.kind, layer: error.layer };
  }

  const name = extractErrorName(error);
  const { kind, layer } = parseErrorName(name);
  if (kind || layer) {
    return {
      ...(kind ? { kind } : {}),
      ...(layer ? { layer } : {}),
    };
  }

  if (name === "ZodError") return { kind: "Validation" };
  if (name === "AbortError") return { kind: "Canceled" };

  return {};
}

/**
 * Resolve just the {@link Kind} from an unknown error.
 *
 * @public
 */
export function resolveErrorKind(error: unknown): Kind | undefined {
  return resolveErrorInfo(error).kind;
}

/**
 * Resolve just the {@link Layer} from an unknown error.
 *
 * @public
 */
export function resolveErrorLayer(error: unknown): Layer | undefined {
  return resolveErrorInfo(error).layer;
}

/**
 * Normalize an unknown value into a {@link RichError}.
 *
 * @public
 */
export function toRichError(
  error: unknown,
  fallback: Partial<NewRichError> = {},
): RichError {
  if (isRichError(error)) return error;

  const reason = fallback.details?.reason ?? extractErrorMessage(error);
  const details = fallback.details ?? (reason ? { reason } : undefined);

  return newRichError({
    cause: error,
    code: fallback.code,
    details,
    i18n: fallback.i18n,
    isOperational: fallback.isOperational,
    kind: fallback.kind ?? "Unknown",
    layer: fallback.layer ?? "External",
    meta: fallback.meta,
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
