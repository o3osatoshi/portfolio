import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import { parseCliWithSchema } from "./cli-zod";
import { DEFAULT_RUNTIME_CONFIG } from "./default-runtime-config";
import type { CliRuntimeConfig } from "./types";

const envSchema = z.object({
  oidcAudience: z.string().min(1),
  oidcClientId: z.string().min(1),
  oidcIssuer: z.string().url(),
  oidcRedirectPort: z.coerce.number().int().min(1).max(65535),
  apiBaseUrl: z
    .string()
    .url()
    .refine(
      (value) => {
        const parsed = new URL(value);
        return parsed.search.length === 0 && parsed.hash.length === 0;
      },
      { message: "Must not include query or hash" },
    ),
});

export function getRuntimeConfig(): Result<CliRuntimeConfig, RichError> {
  const parsed = parseCliWithSchema(
    envSchema,
    {
      oidcAudience:
        process.env["O3O_OIDC_AUDIENCE"] ??
        DEFAULT_RUNTIME_CONFIG.oidc.audience,
      oidcClientId:
        process.env["O3O_OIDC_CLIENT_ID"] ??
        DEFAULT_RUNTIME_CONFIG.oidc.clientId,
      oidcIssuer:
        process.env["O3O_OIDC_ISSUER"] ?? DEFAULT_RUNTIME_CONFIG.oidc.issuer,
      oidcRedirectPort:
        process.env["O3O_OIDC_REDIRECT_PORT"] ??
        String(DEFAULT_RUNTIME_CONFIG.oidc.redirectPort),
      apiBaseUrl:
        process.env["O3O_API_BASE_URL"] ?? DEFAULT_RUNTIME_CONFIG.apiBaseUrl,
    },
    {
      action: "ResolveCliRuntimeConfig",
      code: cliErrorCodes.CLI_CONFIG_INVALID,
      context: "CLI runtime config",
      fallbackHint: "Set valid O3O_* environment variables and retry.",
    },
  );

  if (parsed.isErr()) {
    return err(parsed.error);
  }

  return ok({
    oidc: {
      audience: parsed.value.oidcAudience,
      clientId: parsed.value.oidcClientId,
      issuer: parsed.value.oidcIssuer,
      redirectPort: parsed.value.oidcRedirectPort,
    },
    apiBaseUrl: parsed.value.apiBaseUrl,
  });
}
