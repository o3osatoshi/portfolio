import {
  SessionProvider as NextAuthSessionProvider,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
  useSession as nextAuthUseSession,
} from "next-auth/react";

import type {
  AuthProviderId,
  AuthUser,
  SignInOptions,
  SignOutOptions,
} from "./types";

export { NextAuthSessionProvider as AuthProvider };

export function signIn(provider?: AuthProviderId, options?: SignInOptions) {
  return nextAuthSignIn(provider, options);
}

export function signOut(options?: SignOutOptions) {
  return nextAuthSignOut(options);
}

export function useUser(): AuthUser | undefined {
  const { data } = nextAuthUseSession();
  return data?.user;
}
