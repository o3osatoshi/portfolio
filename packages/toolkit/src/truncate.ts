/**
 * Returns a truncated copy of `value` when it exceeds `max` characters.
 *
 * @param value - Raw string to potentially shorten.
 * @param max - Maximum allowed length before truncation is applied. Defaults to 200.
 * @returns Original `value` when within bounds, otherwise `value` shortened to `max`
 * characters and suffixed with an ellipsis.
 *
 * @example
 * truncate("hello world", 5); // => "hello…"
 */
export function truncate(value: string, max = 200): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}
