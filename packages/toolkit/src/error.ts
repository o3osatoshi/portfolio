type Layer = "Domain" | "Application" | "Infra" | "Auth" | "UI";
type Kind =
  | "Validation"
  | "NotFound"
  | "Conflict"
  | "Timeout"
  | "Forbidden"
  | "RateLimit"
  | "Unknown";

type NewError = {
  layer: Layer;
  kind: Kind;
  action?: string; // what operation was being performed
  reason?: string; // why it failed (short explanation)
  impact?: string; // what the impact is
  hint?: string; // possible next step
  cause?: unknown; // original cause (any type)
};

/** Convert unknown cause into a safe string (prioritize Error.message) */
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

/** Truncate a string to avoid overly large messages */
function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

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
 * - Use `layer` and `kind` to categorize error origin (`Domain`, `Application`, `Infra`, `Auth`, `UI`) and type (`Validation`, `Timeout`, etc.).
 * - Use `action` to describe what failed (e.g. "UpdateTransaction").
 * - Use `reason` to explain why (short, technical).
 * - Use `impact` to describe the consequence.
 * - Use `hint` to suggest a possible fix or next step.
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
 * @param layer - Which architectural layer the error originated in.
 * @param kind - What category/type of error it is.
 * @param action - What operation or use case was attempted.
 * @param reason - Why the error occurred (short explanation).
 * @param impact - What effect this error has.
 * @param hint - Suggestion for recovery or debugging.
 * @param cause - Original underlying error/exception (Error, string, or any object).
 * @returns An Error with enriched `name` and `message`.
 */
export function newError({
  layer,
  kind,
  action,
  reason,
  impact,
  hint,
  cause,
}: NewError): Error {
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

  const err: Error = new Error(message || name);
  err.name = name;

  return err;
}
