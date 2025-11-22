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

export { HonoSessionProvider as AuthProvider };

export async function getUserId(): Promise<string | undefined> {
  const session = await honoGetSession();
  return session?.user?.id;
}

export function signIn(provider?: AuthProviderId, options?: SignInOptions) {
  return honoSignIn(provider, {
    ...(options?.redirectTo && { callbackUrl: options?.redirectTo }),
  });
}

export function signOut(options?: SignOutOptions) {
  return honoSignOut({
    ...(options?.redirectTo && { callbackUrl: options?.redirectTo }),
  });
}

export function useUser(): undefined | User {
  const { data } = honoUseSession();
  if (data?.user === undefined) return undefined;

  const result = userSchema.safeParse(data.user);
  if (!result.success) return undefined;

  return result.data;
}
