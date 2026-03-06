import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./error-catalog";
import { DEFAULT_RUNTIME_CONFIG } from "./runtime-config-defaults";
import type { RuntimeConfig } from "./types";
import { parseCliWithSchema } from "./zod-validation";

const optionalTrimmedStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

const runtimeConfigSchema = z.object({
  oidc: z.object({
    audience: z.string().min(1),
    clientId: z.string().min(1),
    issuer: z.string().url(),
    redirectPort: z.coerce.number().int().min(1).max(65535),
  }),
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

const runtimeEnvFileSchema = z.object({
  envFilePath: optionalTrimmedStringSchema,
});

const tokenStoreEnvSchema = z
  .object({
    allowFileFallback: z.enum(["0", "1"]).optional().default("0"),
    appData: optionalTrimmedStringSchema,
    tokenStoreBackend: z
      .enum(["auto", "file", "keychain"])
      .optional()
      .default("auto"),
    xdgConfigHome: optionalTrimmedStringSchema,
  })
  .transform((value) => ({
    allowFileFallback: value.allowFileFallback === "1",
    appData: value.appData,
    tokenStoreBackend: value.tokenStoreBackend,
    xdgConfigHome: value.xdgConfigHome,
  }));

export type CliTokenStoreEnv = z.infer<typeof tokenStoreEnvSchema>;

export function resolveEnvFilePathFromEnv(
  source: Record<string, string | undefined> = process.env,
): Result<string | undefined, RichError> {
  const parsed = parseCliWithSchema(
    runtimeEnvFileSchema,
    {
      envFilePath: source["O3O_ENV_FILE"],
    },
    {
      action: "ResolveCliEnvFilePath",
      code: cliErrorCodes.CLI_CONFIG_INVALID,
      context: "CLI env file path",
      fallbackHint: "Set O3O_ENV_FILE to a non-empty path and retry.",
    },
  );

  if (parsed.isErr()) {
    return err(parsed.error);
  }

  return ok(parsed.value.envFilePath);
}

export function resolveRuntimeConfigFromEnv(
  source: Record<string, string | undefined> = process.env,
): Result<RuntimeConfig, RichError> {
  const parsed = parseCliWithSchema(
    runtimeConfigSchema,
    {
      oidc: {
        audience:
          source["O3O_OIDC_AUDIENCE"] ?? DEFAULT_RUNTIME_CONFIG.oidc.audience,
        clientId:
          source["O3O_OIDC_CLIENT_ID"] ?? DEFAULT_RUNTIME_CONFIG.oidc.clientId,
        issuer: source["O3O_OIDC_ISSUER"] ?? DEFAULT_RUNTIME_CONFIG.oidc.issuer,
        redirectPort:
          source["O3O_OIDC_REDIRECT_PORT"] ??
          String(DEFAULT_RUNTIME_CONFIG.oidc.redirectPort),
      },
      apiBaseUrl:
        source["O3O_API_BASE_URL"] ?? DEFAULT_RUNTIME_CONFIG.apiBaseUrl,
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

  return ok(parsed.value);
}

export function resolveTokenStoreEnvFromEnv(
  source: Record<string, string | undefined> = process.env,
): Result<CliTokenStoreEnv, RichError> {
  const parsed = parseCliWithSchema(
    tokenStoreEnvSchema,
    {
      allowFileFallback: source["O3O_ALLOW_FILE_TOKEN_STORE"],
      appData: source["APPDATA"],
      tokenStoreBackend: source["O3O_TOKEN_STORE_BACKEND"],
      xdgConfigHome: source["XDG_CONFIG_HOME"],
    },
    {
      action: "ResolveCliTokenStoreEnv",
      code: cliErrorCodes.CLI_CONFIG_INVALID,
      context: "CLI token store env",
      fallbackHint:
        "Set O3O_TOKEN_STORE_BACKEND to auto|file|keychain and O3O_ALLOW_FILE_TOKEN_STORE to 0|1.",
    },
  );

  if (parsed.isErr()) {
    return err(parsed.error);
  }

  return ok(parsed.value);
}
