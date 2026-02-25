/**
 * Remove one trailing "/" from a URL-like string.
 *
 * This keeps behavior compatible with existing normalization logic that
 * only removes one trailing slash when present.
 *
 * @public
 */
export function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
