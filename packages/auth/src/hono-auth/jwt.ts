import { getToken } from "@auth/core/jwt";

export type AuthJwt = Awaited<ReturnType<typeof getToken>>;

export type GetUserIdOptions = {
  /**
   * Raw `Cookie` header value (for example, `request.headers.get("cookie")`).
   */
  cookie: string;
  /**
   * Auth.js secret used to decode the JWT.
   */
  secret: string;
};

/**
 * Resolve a user id from the Auth.js session JWT stored in cookies.
 *
 * This helper:
 * - Detects the correct Auth.js session cookie name (secure or non-secure).
 * - Decodes the JWT via `@auth/core/jwt#getToken`.
 * - Returns `token.id` (or `token.sub` as a fallback).
 *
 * @returns The user id if present, otherwise `undefined`.
 */
export async function getUserId({
  cookie,
  secret,
}: GetUserIdOptions): Promise<string | undefined> {
  const cookieName = resolveAuthCookieName(cookie);
  const token = await getToken({
    cookieName,
    req: { headers: { cookie } },
    salt: cookieName,
    secret,
  });

  if (!token || typeof token !== "object") return undefined;
  if (typeof token["id"] === "string") return token["id"];
  if (typeof token["sub"] === "string") return token["sub"];
  return undefined;
}

/**
 * Resolve the Auth.js session cookie name from a raw `Cookie` header value.
 *
 * Auth.js prefers a secure cookie prefix (`__Secure-`) when available; this
 * helper centralizes that lookup.
 */
export function resolveAuthCookieName(cookieHeader: string): string {
  const secureCookieName = "__Secure-authjs.session-token";
  return cookieHeader.includes(`${secureCookieName}=`)
    ? secureCookieName
    : "authjs.session-token";
}

export { getToken };
