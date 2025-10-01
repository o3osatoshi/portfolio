/**
 * Generic error classifications shared across application layers.
 */
type Kind =
  | "Config"
  | "Conflict"
  | "Deadlock"
  | "Forbidden"
  | "Integrity"
  | "NotFound"
  | "RateLimit"
  | "Serialization"
  | "Timeout"
  | "Unauthorized"
  | "Unavailable"
  | "Unknown"
  | "Validation";

/**
 * Architectural layer where the error originated.
 */
type Layer =
  | "Application"
  | "Auth"
  | "DB"
  | "Domain"
  | "External"
  | "Infra"
  | "UI";

/**
 * Payload used to construct a structured {@link Error} via {@link newError}.
 */
type NewError = {
  action?: string | undefined; // what operation was being performed
  cause?: undefined | unknown; // original cause (any type)
  hint?: string | undefined; // possible next step
  impact?: string | undefined; // what the impact is
  kind: Kind;
  layer: Layer;
  reason?: string | undefined; // why it failed (short explanation)
};
/**
 * Creates a structured Error object with a consistent `name` and `message`.
 * Intended for use in Domain/Application/Infra/Auth/UI layers where you want
 * more context than a plain `new Error(...)`.
 *
 * ## Error name
 * - Computed as `<Layer><Kind>Error` (e.g. `DomainValidationError`).
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
 * throw newError({
 *   layer: "Domain",
 *   kind: "Validation",
 *   action: "CreateUser",
 *   reason: "email format is invalid",
 *   impact: "user cannot be registered",
 *   hint: "ensure email has @",
 *   cause: originalError,
 * });
 * ```
 *
 * @param params - Structured descriptor for the error (layer, kind, and optional metadata).
 * @returns An Error with enriched `name` and `message`.
 * @public
 */
export function newError(params: NewError): Error {
  const { action, cause, hint, impact, kind, layer, reason } = params;
  const name = `${layer}${kind}Error`;

  const causeText = summarizeCause(cause);
  const messages = [
    action ? `${action} failed` : "Operation failed",
    reason ? `because ${reason}` : undefined,
    impact ? `Impact: ${impact}.` : undefined,
    hint ? `Hint: ${hint}.` : undefined,
    causeText ? `Cause: ${causeText}.` : undefined,
  ].filter(Boolean);
  const message = messages.join(" ");

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
  if (cause instanceof Error) return truncate(cause.message, max);
  if (typeof cause === "string") return truncate(cause, max);
  try {
    return truncate(JSON.stringify(cause), max);
  } catch {
    return String(cause);
  }
}

/** Truncate a string to avoid overly large messages. */
function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
