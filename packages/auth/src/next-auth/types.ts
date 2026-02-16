export type AuthProviderId = "oidc";

export type SignInOptions = {
  redirectTo?: string;
};

export type SignOutOptions = {
  redirectTo?: string;
};

export interface User {
  email?: null | string;
  id?: string;
  image?: null | string;
  name?: null | string;
}
