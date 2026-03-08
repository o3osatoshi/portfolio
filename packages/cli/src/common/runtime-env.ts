import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./error-catalog";
import { DEFAULT_RUNTIME_ENV } from "./runtime-config-defaults";
import { type RuntimeEnv, runtimeEnvSchema } from "./types";
import { makeCliSchemaParser } from "./zod-validation";

const optionalTrimmedStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

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

export type TokenStoreEnv = z.infer<typeof tokenStoreEnvSchema>;

export function resolveEnvFilePathFromEnv(
  source: Record<string, string | undefined> = process.env,
): Result<string | undefined, RichError> {
  const env = makeCliSchemaParser(runtimeEnvFileSchema, {
    action: "ResolveCliEnvFilePath",
    code: cliErrorCodes.CLI_CONFIG_INVALID,
    context: "CLI env file path",
    fallbackHint: "Set O3O_ENV_FILE to a non-empty path and retry.",
  })({
    envFilePath: source["O3O_ENV_FILE"],
  });

  if (env.isErr()) {
    return err(env.error);
  }

  return ok(env.value.envFilePath);
}

export function resolveRuntimeEnv(
  source: Record<string, string | undefined> = process.env,
): Result<RuntimeEnv, RichError> {
  const env = makeCliSchemaParser(runtimeEnvSchema, {
    action: "ResolveCliRuntimeConfig",
    code: cliErrorCodes.CLI_CONFIG_INVALID,
    context: "CLI runtime config",
    fallbackHint: "Set valid O3O_* environment variables and retry.",
  })({
    oidc: {
      audience:
        source["O3O_OIDC_AUDIENCE"] ?? DEFAULT_RUNTIME_ENV.oidc.audience,
      clientId:
        source["O3O_OIDC_CLIENT_ID"] ?? DEFAULT_RUNTIME_ENV.oidc.clientId,
      issuer: source["O3O_OIDC_ISSUER"] ?? DEFAULT_RUNTIME_ENV.oidc.issuer,
      redirectPort: Number(
        source["O3O_OIDC_REDIRECT_PORT"] ??
          String(DEFAULT_RUNTIME_ENV.oidc.redirectPort),
      ),
    },
    apiBaseUrl: source["O3O_API_BASE_URL"] ?? DEFAULT_RUNTIME_ENV.apiBaseUrl,
  });

  if (env.isErr()) {
    return err(env.error);
  }

  return ok(env.value);
}

export function resolveTokenStoreEnv(
  source: Record<string, string | undefined> = process.env,
): Result<TokenStoreEnv, RichError> {
  const env = makeCliSchemaParser(tokenStoreEnvSchema, {
    action: "ResolveCliTokenStoreEnv",
    code: cliErrorCodes.CLI_CONFIG_INVALID,
    context: "CLI token store env",
    fallbackHint:
      "Set O3O_TOKEN_STORE_BACKEND to auto|file|keychain and O3O_ALLOW_FILE_TOKEN_STORE to 0|1.",
  })({
    allowFileFallback: source["O3O_ALLOW_FILE_TOKEN_STORE"],
    appData: source["APPDATA"],
    tokenStoreBackend: source["O3O_TOKEN_STORE_BACKEND"],
    xdgConfigHome: source["XDG_CONFIG_HOME"],
  });

  if (env.isErr()) {
    return err(env.error);
  }

  return ok(env.value);
}
