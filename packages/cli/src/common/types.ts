export type OidcClientConfig = {
  audience: string;
  clientId: string;
  issuer: string;
  redirectPort: number;
};

export type OidcTokenSet = {
  access_token: string;
  expires_at?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

export type RuntimeConfig = {
  apiBaseUrl: string;
  oidc: OidcClientConfig;
};
