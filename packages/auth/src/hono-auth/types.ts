export interface AdapterUser extends User {
  email: string;
  emailVerified: Date | null;
  id: string;
}

export type AuthProviderId = "google";

export interface AuthUser {
  session: Session;
  token?: JWT;
  user?: AdapterUser;
}

export interface JWT {
  email?: null | string;
  exp?: number;
  iat?: number;
  jti?: string;
  name?: null | string;
  picture?: null | string;
  sub?: string;
}

export interface Session {
  expires: ISODateString;
  user?: User;
}

export interface SignInOptions {
  redirectTo?: string;
}

export interface SignOutOptions {
  redirectTo?: string;
}

export interface User {
  email?: null | string;
  id?: string;
  image?: null | string;
  name?: null | string;
}

type ISODateString = string;
