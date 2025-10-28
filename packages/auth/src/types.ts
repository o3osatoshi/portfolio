// Known provider ids used within the repo. Keep open for future providers.
export type AuthProviderId = "google";

export type AuthUser = {
  email?: null | string;
  id?: string;
  image?: null | string;
  name?: null | string;
};

export type SignInOptions = {
  redirectTo?: string;
};

export type SignOutOptions = {
  redirectTo?: string;
};
