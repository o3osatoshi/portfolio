import type { Result, ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

export type CliResult<T> = Result<T, RichError>;

export type CliResultAsync<T> = ResultAsync<T, RichError>;
export type CliRuntimeConfig = {
  apiBaseUrl: string;
  oidc: OidcConfig;
};

export type OidcConfig = {
  audience: string;
  clientId: string;
  issuer: string;
  redirectPort: number;
};

export type TokenSet = {
  access_token: string;
  expires_at?: number | undefined;
  refresh_token?: string | undefined;
  scope?: string | undefined;
  token_type?: string | undefined;
};
