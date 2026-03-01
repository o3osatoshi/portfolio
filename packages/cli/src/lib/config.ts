import { err, ok } from "neverthrow";
import { z } from "zod";

import { newRichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import type { CliResult, CliRuntimeConfig } from "./types";

const envSchema = z.object({
  oidcAudience: z.string().min(1),
  oidcClientId: z.string().min(1),
  oidcIssuer: z.string().url(),
  oidcRedirectPort: z.coerce.number().int().min(1).max(65535),
  apiBaseUrl: z.string().url(),
});

export function getRuntimeConfig(): CliResult<CliRuntimeConfig> {
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
    return err(
      newRichError({
        code: cliErrorCodes.CLI_CONFIG_INVALID,
        details: {
          action: "ResolveCliRuntimeConfig",
          reason: `Invalid CLI runtime config: ${reason}`,
        },
        isOperational: true,
        kind: "Validation",
        layer: "Presentation",
      }),
    );
  }

  return ok({
    oidc: {
      audience: parsed.data.oidcAudience,
      clientId: parsed.data.oidcClientId,
      issuer: parsed.data.oidcIssuer,
      redirectPort: parsed.data.oidcRedirectPort,
    },
    apiBaseUrl: parsed.data.apiBaseUrl,
  });
}
