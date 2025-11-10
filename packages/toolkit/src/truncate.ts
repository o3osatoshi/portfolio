/**
 * Returns a truncated copy of `value` when it exceeds `maxLen` characters.
 *
 * Semantics of `maxLen`:
 * - number: truncate to the specified length.
 * - undefined: use the default length (200) for truncation.
 * - null: do not truncate (return the original string).
 *
 * @example
 * ```ts
 * truncate("hello world", 5);    // => "hello…"
 * truncate("hello world");       // => defaults to 200, returns original here
 * truncate("hello world", null); // => no truncation
 * ```
 *
 * @public
 * @param value - Raw string to potentially shorten.
 * @param maxLen - Maximum allowed length before truncation is applied; `null` disables truncation.
 * @returns Original `value` when within bounds, otherwise `value` shortened to `maxLen`
 * characters and suffixed with an ellipsis.
 */
export function truncate(value: string, maxLen?: null | number): string {
  if (maxLen === null) return value;
  const limit = maxLen ?? 200;
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
}
