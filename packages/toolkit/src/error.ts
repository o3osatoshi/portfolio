import { extractErrorMessage, extractErrorName } from "./error-attributes";
import { composeErrorMessage, composeErrorName } from "./error-format";
import { truncate } from "./truncate";

/**
 * Generic error classifications shared across application layers.
 *
 * Recommended meanings (and default HTTP mappings used by `toHttpErrorResponse()`):
 * - `"BadGateway"` → upstream dependency returned an invalid/5xx response (502).
 * - `"BadRequest"` → malformed payload or invalid query before validation (400).
 * - `"Canceled"` → caller canceled or aborted the request (499).
 * - `"Config"` → server-side misconfiguration detected (500).
 * - `"Conflict"` → state/version mismatch such as optimistic locking (409).
 * - `"Deadlock"` → concurrency deadlock detected by the data store (409).
 * - `"Forbidden"` → authenticated caller lacks permission (403).
 * - `"Integrity"` → constraint violations such as unique/index failures (409).
 * - `"MethodNotAllowed"` → HTTP verb not supported for the resource (405).
 * - `"NotFound"` → entity or route missing (404).
 * - `"RateLimit"` → throttling or quota exceeded (429).
 * - `"Serialization"` → encode/decode failures (500).
 * - `"Timeout"` → upstream or local job timed out (504).
 * - `"Unauthorized"` → authentication missing or invalid (401).
 * - `"Unavailable"` → dependency or subsystem temporarily down (503).
 * - `"Unknown"` → fallback for uncategorized errors (500).
 * - `"Unprocessable"` → semantically invalid input even though syntactically valid (422).
 * - `"Validation"` → domain/application validation error (400).
 *
 * @public
 */
export type Kind =
  | "BadGateway"
  | "BadRequest"
  | "Canceled"
  | "Config"
  | "Conflict"
  | "Deadlock"
  | "Forbidden"
  | "Integrity"
  | "MethodNotAllowed"
  | "NotFound"
  | "RateLimit"
  | "Serialization"
  | "Timeout"
  | "Unauthorized"
  | "Unavailable"
  | "Unknown"
  | "Unprocessable"
  | "Validation";

/**
 * Architectural layer where the error originated.
 *
 * @public
 */
export type Layer =
  | "Application"
  | "Auth"
  | "DB"
  | "Domain"
  | "External"
  | "Infra"
  | "UI";

/**
 * Structured descriptor passed into {@link newError}, exported for consumers
 * that want to build wrappers or share strongly typed error payloads.
 *
 * @public
 */
export type NewError = {
  /** Logical operation being performed when the error occurred. */
  action?: string | undefined;
  /** Original cause (any type) captured for diagnostic context. */
  cause?: undefined | unknown;
  /** Suggested follow-up or remediation for the caller. */
  hint?: string | undefined;
  /** Description of the resulting effect or blast radius. */
  impact?: string | undefined;
  /** High-level error classification shared across layers. */
  kind: Kind;
  /** Architectural layer where the failure originated. */
  layer: Layer;
  /** Short explanation of why the operation failed. */
  reason?: string | undefined;
};

/**
 * Creates a structured Error object with a consistent `name` and `message`.
 * Intended for use in Domain/Application/Infra/Auth/UI layers where you want
 * more context than a plain `new Error(...)`.
 *
 * ## Error name
 * - Computed as `Layer + Kind + "Error"` (for example `DomainValidationError`).
 * - Useful for quick classification or HTTP mapping.
 *
 * ## Error message
 * - Built from the provided `action`, `reason`, `impact`, `hint`, and a
 *   summarized version of the original `cause` (if any).
 * - Order: action → reason → impact → hint → cause.
 * - Example: `"UpdateTransaction failed because transaction not found. Impact: no update applied. Hint: verify txId. Cause: DB timeout."`
 *
 * ## Cause handling
 * - If `cause` is an `Error`, its `.message` is extracted and appended as `Cause: ...`.
 * - If `cause` is a string, it is used directly.
 * - If `cause` is any other object, it is JSON stringified when possible.
 * - Note: the original `cause` is NOT attached to the returned `Error`; it is
 *   only summarized into the message.
 *
 * ## Recommended usage
 * - Use `layer` and `kind` to categorize error origin (`Domain`, `Application`, `Infra`, `Auth`, `UI`, `DB`, `External`) and type (`Validation`, `Timeout`, `Unavailable`, `Integrity`, `Deadlock`, `Serialization`, etc.).
 * - Use `action` to describe what failed (e.g. "UpdateTransaction").
 * - Use `reason` to explain why (short, technical).
 * - Use `impact` to describe the consequence.
 * - Use `hint` to suggest a possible fix or next step.
 *
 * @remarks
 * The `params` object accepts the following fields:
 * - `layer`: Architectural layer where the failure happened (required).
 * - `kind`: High-level error classification (required).
 * - `action`: Logical operation being performed.
 * - `reason`: Short explanation of the failure cause.
 * - `impact`: Description of the resulting effect.
 * - `hint`: Suggested follow-up or remediation.
 * - `cause`: Original error or data that triggered the failure.
 *
 * @example
 * ```ts
 * throw newError(\{
 *   layer: "Domain",
 *   kind: "Validation",
 *   action: "CreateUser",
 *   reason: "email format is invalid",
 *   impact: "user cannot be registered",
 *   hint: "ensure email has @",
 *   cause: originalError,
 * \});
 * ```
 *
 * @param params - Structured descriptor for the error (see {@link NewError}).
 * @returns An Error with enriched `name` and `message`.
 * @public
 */
export function newError(params: NewError): Error {
  const { action, cause, hint, impact, kind, layer, reason } = params;
  const name = composeErrorName(layer, kind);

  const causeText = summarizeCause(cause);
  const message = composeErrorMessage({
    action,
    causeText,
    hint,
    impact,
    reason,
  });

  // Try to attach native `cause` (ErrorOptions) when available
  let err: Error;
  try {
    // Node >=16 supports ErrorOptions; TS may not know, so cast
    err = new (
      Error as unknown as new (
        m?: string,
        o?: { cause?: unknown },
      ) => Error
    )(message || name, cause !== undefined ? { cause } : undefined);
  } catch {
    err = new Error(message || name);
    // As a fallback, attach cause as a non-enumerable property to avoid noisy JSON
    if (cause !== undefined) {
      try {
        Object.defineProperty(err, "cause", {
          enumerable: false,
          value: cause,
        });
      } catch {
        // ignore if defineProperty fails
      }
    }
  }
  err.name = name;

  return err;
}

/** Convert an unknown cause into a safe string (prioritize `Error.message`). */
function summarizeCause(cause: unknown, max = 300): string | undefined {
  if (cause == null) return;

  const name = extractErrorName(cause);
  const message = extractErrorMessage(cause);
  if (typeof message === "string") {
    if (typeof name === "string" && name.length > 0 && name !== "Error") {
      return truncate(`${name}: ${message}`, max);
    }
    return truncate(message, max);
  }
  if (typeof name === "string" && name.length > 0) {
    return truncate(name, max);
  }

  try {
    const serialized = JSON.stringify(cause);
    if (!serialized) return;
    return truncate(serialized, max);
  } catch {
    const fallback = String(cause);
    return fallback ? truncate(fallback, max) : undefined;
  }
}
