import type { CliRuntimeConfig } from "./types";

export const DEFAULT_RUNTIME_CONFIG: CliRuntimeConfig = {
  oidc: {
    audience: "https://api.o3o.app",
    clientId: "fHkQMeu3w3HHjy4c1Jh7sossO6R7QY1V",
    issuer: "https://dev-yr26ks6rmc6zj8nj.us.auth0.com",
    redirectPort: 38080,
  },
  apiBaseUrl: "https://o3osatoshi.engr.work",
};
