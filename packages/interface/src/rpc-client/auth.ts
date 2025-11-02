/**
 * Authentication configuration for HTTP requests.
 *
 * - `bearer`: Adds an `Authorization: Bearer <token>` header.
 * - `cookie`: Adds a `Cookie` header as provided.
 * - `none`: Leaves the request unchanged.
 */
export type AuthConfig =
  | { cookie: string; type: "cookie" }
  | { token: string; type: "bearer" }
  | { type: "none" };

/**
 * Apply authentication headers to a `RequestInit` object.
 *
 * Existing headers in `init` are preserved and augmented.
 * When `auth` is `undefined` or `{ type: "none" }`, the original
 * `RequestInit` is returned as-is.
 *
 * @param init Base `RequestInit` to augment.
 * @param auth Optional {@link AuthConfig} describing how to authenticate.
 * @returns A new `RequestInit` with appropriate auth headers applied.
 */
export function withAuth(
  init: RequestInit = {},
  auth?: AuthConfig,
): RequestInit {
  if (!auth || auth.type === "none") return init;

  const headers = new Headers(init.headers);

  if (auth.type === "bearer") {
    headers.set("Authorization", `Bearer ${auth.token}`);
  }

  if (auth.type === "cookie") {
    headers.set("Cookie", auth.cookie);
  }

  return {
    ...init,
    headers,
  };
}
