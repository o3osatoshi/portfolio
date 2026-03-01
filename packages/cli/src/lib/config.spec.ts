import { beforeEach, describe, expect, it, vi } from "vitest";

import { cliErrorCodes } from "./cli-error-catalog";
import { DEFAULT_RUNTIME_CONFIG } from "./default-runtime-config";

describe("lib/config", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    delete process.env["O3O_OIDC_AUDIENCE"];
    delete process.env["O3O_OIDC_CLIENT_ID"];
    delete process.env["O3O_OIDC_ISSUER"];
    delete process.env["O3O_OIDC_REDIRECT_PORT"];
    delete process.env["O3O_API_BASE_URL"];
    delete process.env["LEGACY_UNUSED_OIDC_AUDIENCE"];
    delete process.env["LEGACY_UNUSED_OIDC_CLIENT_ID"];
    delete process.env["LEGACY_UNUSED_OIDC_ISSUER"];
    delete process.env["LEGACY_UNUSED_API_BASE_URL"];
  });

  it("uses built-in defaults when O3O env vars are not set", async () => {
    const { getRuntimeConfig } = await import("./config");
    const result = getRuntimeConfig();

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual(DEFAULT_RUNTIME_CONFIG);
  });

  it("overrides defaults with O3O env vars", async () => {
    vi.stubEnv("O3O_OIDC_ISSUER", "https://example.auth0.com");
    vi.stubEnv("O3O_OIDC_CLIENT_ID", "new-client-id");
    vi.stubEnv("O3O_OIDC_AUDIENCE", "https://example.api");
    vi.stubEnv("O3O_OIDC_REDIRECT_PORT", "39090");
    vi.stubEnv("O3O_API_BASE_URL", "https://api.example.com");

    const { getRuntimeConfig } = await import("./config");
    const result = getRuntimeConfig();

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual({
      oidc: {
        audience: "https://example.api",
        clientId: "new-client-id",
        issuer: "https://example.auth0.com",
        redirectPort: 39090,
      },
      apiBaseUrl: "https://api.example.com",
    });
  });

  it("returns validation error for invalid redirect port", async () => {
    vi.stubEnv("O3O_OIDC_REDIRECT_PORT", "abc");

    const { getRuntimeConfig } = await import("./config");
    const result = getRuntimeConfig();

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_CONFIG_INVALID);
    expect(result.error.details?.reason).toMatch(/oidcRedirectPort/i);
  });

  it("ignores unrelated environment variables", async () => {
    vi.stubEnv("LEGACY_UNUSED_OIDC_AUDIENCE", "https://legacy-api.example");
    vi.stubEnv("LEGACY_UNUSED_OIDC_CLIENT_ID", "legacy-client-id");
    vi.stubEnv("LEGACY_UNUSED_OIDC_ISSUER", "https://legacy.example.auth0.com");
    vi.stubEnv("LEGACY_UNUSED_API_BASE_URL", "https://legacy.example.com");

    const { getRuntimeConfig } = await import("./config");
    const result = getRuntimeConfig();

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual(DEFAULT_RUNTIME_CONFIG);
  });
});
