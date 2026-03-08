import { describe, expect, it } from "vitest";

import { cliErrorCodes } from "./error-catalog";
import { DEFAULT_RUNTIME_CONFIG } from "./runtime-config-defaults";
import {
  resolveEnvFilePathFromEnv,
  resolveRuntimeEnv,
  resolveTokenStoreEnv,
} from "./runtime-env";

describe("common/runtime-env", () => {
  it("resolves runtime config defaults when O3O env vars are not set", () => {
    const env = resolveRuntimeEnv({});

    expect(env.isOk()).toBe(true);
    if (env.isErr()) throw new Error("Expected ok result");
    expect(env.value).toEqual(DEFAULT_RUNTIME_CONFIG);
  });

  it("rejects O3O_API_BASE_URL that includes query/hash", () => {
    const env = resolveRuntimeEnv({
      O3O_API_BASE_URL: "https://api.example.com?env=dev#anchor",
    });

    expect(env.isErr()).toBe(true);
    if (env.isOk()) throw new Error("Expected err result");
    expect(env.error.code).toBe(cliErrorCodes.CLI_CONFIG_INVALID);
    expect(env.error.details?.reason).toMatch(/apiBaseUrl/i);
    expect(env.error.details?.reason).toMatch(/query or hash/i);
  });

  it("treats empty O3O_ENV_FILE as undefined", () => {
    const result = resolveEnvFilePathFromEnv({
      O3O_ENV_FILE: "   ",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toBeUndefined();
  });

  it("resolves token-store env defaults when env vars are not set", () => {
    const env = resolveTokenStoreEnv({});

    expect(env.isOk()).toBe(true);
    if (env.isErr()) throw new Error("Expected ok result");
    expect(env.value).toEqual({
      allowFileFallback: false,
      appData: undefined,
      tokenStoreBackend: "auto",
      xdgConfigHome: undefined,
    });
  });

  it("fails when O3O_TOKEN_STORE_BACKEND has invalid value", () => {
    const env = resolveTokenStoreEnv({
      O3O_TOKEN_STORE_BACKEND: "invalid-backend",
    });

    expect(env.isErr()).toBe(true);
    if (env.isOk()) throw new Error("Expected err result");
    expect(env.error.code).toBe(cliErrorCodes.CLI_CONFIG_INVALID);
    expect(env.error.details?.reason).toMatch(/tokenStoreBackend/i);
  });
});
