import { beforeEach, describe, expect, it, vi } from "vitest";

describe("lib/config", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv("AUTH_OIDC_AUDIENCE", "https://api.o3o.app");
    vi.stubEnv("AUTH_OIDC_CLIENT_ID", "cli-client-id");
    vi.stubEnv("AUTH_OIDC_ISSUER", "https://example.auth0.com");
  });

  it("falls back to localhost for apiBaseUrl in non-production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env["O3O_API_BASE_URL"];
    delete process.env["PORTFOLIO_API_BASE_URL"];

    const { getRuntimeConfig } = await import("./config");
    const config = getRuntimeConfig();

    expect(config.apiBaseUrl).toBe("http://localhost:3000");
  });

  it("throws in production when apiBaseUrl is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env["O3O_API_BASE_URL"];
    delete process.env["PORTFOLIO_API_BASE_URL"];

    const { getRuntimeConfig } = await import("./config");

    expect(() => getRuntimeConfig()).toThrowError(/apiBaseUrl/i);
  });

  it("throws when oidc issuer is not a valid URL", async () => {
    vi.stubEnv("AUTH_OIDC_ISSUER", "example.auth0.com");
    vi.stubEnv("NODE_ENV", "development");

    const { getRuntimeConfig } = await import("./config");

    expect(() => getRuntimeConfig()).toThrowError(/oidcIssuer/i);
  });
});
