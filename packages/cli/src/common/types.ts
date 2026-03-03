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
  expires_at?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};
