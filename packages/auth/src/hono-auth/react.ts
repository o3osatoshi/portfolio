import {
  getSession as honoGetSession,
  SessionProvider as HonoSessionProvider,
  signIn as honoSignIn,
  signOut as honoSignOut,
  useSession as honoUseSession,
} from "@hono/auth-js/react";

import {
  type AuthProviderId,
  type SignInOptions,
  type SignOutOptions,
  type User,
  userSchema,
} from "./types";

/**
 * React provider alias to keep auth entrypoints consistent across apps.
 *
 * @public
 */
export { HonoSessionProvider as AuthProvider };

/**
 * Resolve the current user id from the active session.
 *
 * @returns User id when authenticated; otherwise `undefined`.
 * @public
 */
export async function getUserId(): Promise<string | undefined> {
  const session = await honoGetSession();
  return session?.user?.id;
}

/**
 * Begin an auth provider sign-in flow.
 *
 * - `provider` selects the OIDC provider id (default: default provider).
 * - `options.redirectTo` sets the post-sign-in redirect URL.
 *
 * @param provider Provider id.
 * @param options Redirect and provider options.
 * @returns Promise returned by the underlying auth client.
 * @public
 */
export function signIn(provider?: AuthProviderId, options?: SignInOptions) {
  return honoSignIn(provider, {
    ...(options?.redirectTo && { callbackUrl: options?.redirectTo }),
  });
}

/**
 * Begin an auth provider sign-out flow.
 *
 * @param options Optional redirect target after sign-out.
 * @returns Promise returned by the underlying auth client.
 * @public
 */
export function signOut(options?: SignOutOptions) {
  return honoSignOut({
    ...(options?.redirectTo && { callbackUrl: options?.redirectTo }),
  });
}

/**
 * Read and validate the signed-in user object from auth session state.
 *
 * Validation is intentionally defensive: malformed sessions are treated as unauthenticated.
 *
 * @returns Parsed user object when available and valid; otherwise `undefined`.
 * @public
 */
export function useUser(): undefined | User {
  const { data } = honoUseSession();
  if (data?.user === undefined) return undefined;

  const result = userSchema.safeParse(data.user);
  if (!result.success) return undefined;

  return result.data;
}
