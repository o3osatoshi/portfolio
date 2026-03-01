import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import { DEFAULT_RUNTIME_CONFIG } from "./default-runtime-config";
import type { CliRuntimeConfig } from "./types";

const envSchema = z.object({
  oidcAudience: z.string().min(1),
  oidcClientId: z.string().min(1),
  oidcIssuer: z.string().url(),
  oidcRedirectPort: z.coerce.number().int().min(1).max(65535),
  apiBaseUrl: z.string().url(),
});

export function getRuntimeConfig(): Result<CliRuntimeConfig, RichError> {
  const parsed = envSchema.safeParse({
    oidcAudience:
      process.env["O3O_OIDC_AUDIENCE"] ?? DEFAULT_RUNTIME_CONFIG.oidc.audience,
    oidcClientId:
      process.env["O3O_OIDC_CLIENT_ID"] ?? DEFAULT_RUNTIME_CONFIG.oidc.clientId,
    oidcIssuer:
      process.env["O3O_OIDC_ISSUER"] ?? DEFAULT_RUNTIME_CONFIG.oidc.issuer,
    oidcRedirectPort:
      process.env["O3O_OIDC_REDIRECT_PORT"] ??
      String(DEFAULT_RUNTIME_CONFIG.oidc.redirectPort),
    apiBaseUrl:
      process.env["O3O_API_BASE_URL"] ?? DEFAULT_RUNTIME_CONFIG.apiBaseUrl,
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
