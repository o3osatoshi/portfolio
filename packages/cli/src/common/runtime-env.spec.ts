import { describe, expect, it } from "vitest";

import { cliErrorCodes } from "./error-catalog";
import { DEFAULT_RUNTIME_CONFIG } from "./runtime-config-defaults";
import {
  resolveEnvFilePathFromEnv,
  resolveRuntimeConfigFromEnv,
  resolveTokenStoreEnvFromEnv,
} from "./runtime-env";

describe("common/runtime-env", () => {
  it("resolves runtime config defaults when O3O env vars are not set", () => {
    const result = resolveRuntimeConfigFromEnv({});

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual(DEFAULT_RUNTIME_CONFIG);
  });

  it("rejects O3O_API_BASE_URL that includes query/hash", () => {
    const result = resolveRuntimeConfigFromEnv({
      O3O_API_BASE_URL: "https://api.example.com?env=dev#anchor",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_CONFIG_INVALID);
    expect(result.error.details?.reason).toMatch(/apiBaseUrl/i);
    expect(result.error.details?.reason).toMatch(/query or hash/i);
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
    const result = resolveTokenStoreEnvFromEnv({});

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual({
      allowFileFallback: false,
      appData: undefined,
      tokenStoreBackend: "auto",
      xdgConfigHome: undefined,
    });
  });

  it("fails when O3O_TOKEN_STORE_BACKEND has invalid value", () => {
    const result = resolveTokenStoreEnvFromEnv({
      O3O_TOKEN_STORE_BACKEND: "invalid-backend",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_CONFIG_INVALID);
    expect(result.error.details?.reason).toMatch(/tokenStoreBackend/i);
  });
});
