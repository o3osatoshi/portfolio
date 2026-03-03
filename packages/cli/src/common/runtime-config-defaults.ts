import type { CliRuntimeConfig } from "./types";

export const DEFAULT_RUNTIME_CONFIG: CliRuntimeConfig = {
  oidc: {
    audience: "https://api.o3o.app",
    clientId: "NCWwZFxrbAu2TR1gJy2jPJNOqb7NInuf",
    issuer: "https://dev-yr26ks6rmc6zj8nj.us.auth0.com",
    redirectPort: 38080,
  },
  apiBaseUrl: "https://o3osatoshi.engr.work",
};
