import { z } from "zod";

import type { CliRuntimeConfig } from "./types";

const envSchema = z.object({
  oidcAudience: z.string().min(1),
  oidcClientId: z.string().min(1),
  oidcIssuer: z.string().min(1),
  oidcRedirectPort: z.coerce.number().int().min(1).max(65535),
  apiBaseUrl: z.string().url(),
});

export function getRuntimeConfig(): CliRuntimeConfig {
  const fallbackApiBaseUrl =
    process.env["NODE_ENV"] === "production"
      ? undefined
      : "http://localhost:3000";

  const parsed = envSchema.safeParse({
    oidcAudience:
      process.env["O3O_OIDC_AUDIENCE"] ?? process.env["AUTH_OIDC_AUDIENCE"],
    oidcClientId:
      process.env["O3O_OIDC_CLIENT_ID"] ?? process.env["AUTH_OIDC_CLIENT_ID"],
    oidcIssuer:
      process.env["O3O_OIDC_ISSUER"] ?? process.env["AUTH_OIDC_ISSUER"],
    oidcRedirectPort: process.env["O3O_OIDC_REDIRECT_PORT"] ?? "38080",
    apiBaseUrl:
      process.env["O3O_API_BASE_URL"] ??
      process.env["PORTFOLIO_API_BASE_URL"] ??
      fallbackApiBaseUrl,
  });

  if (!parsed.success) {
    const reason = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid CLI runtime config: ${reason}`);
  }

  return {
    oidc: {
      audience: parsed.data.oidcAudience,
      clientId: parsed.data.oidcClientId,
      issuer: parsed.data.oidcIssuer,
      redirectPort: parsed.data.oidcRedirectPort,
    },
    apiBaseUrl: parsed.data.apiBaseUrl,
  };
}
